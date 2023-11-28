import * as WebSocket from 'ws'
import { EventInfo, IncomingMessage, OutgoingMessage } from './hass/hass-message.types'
import { DriverBase } from '@src/architecture/driver.base'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import { MultiRegex, utcToLocal } from '@src/utilities'
import { IMessageContent, KnownContent } from '@src/architecture/message.model'
import { ValueStateUpdate } from '@src/architecture/known-content/value-state-update.model'
import { appendFile, readFile } from 'fs/promises'
import {
  LightOnoffState,
  LightOnoffStateUpdate,
  OpenCloseStateUpdate,
  PresenceStateUpdate,
} from '@src/architecture/known-content/enum-state-update.models'
import { LightDimStateUpdate } from '@src/architecture/known-content/single-value-update.models'
import { crush, first, isString, keys, mapEntries, mapKeys } from 'radash'

const logFilePath = 'C:\\Users\\stefa\\Documents\\projecten\\hass-ts-automation\\hass-driver.log'

export default class HassDriver extends DriverBase {
  public readonly name = 'Home Assistant'
  public readonly version = '0.0.1'
  public readonly id = 'hass'
  private cmdIdCounter = 1
  private ws: WebSocket
  private readonly hassWsUrl: string
  private readonly accessToken: string
  private startPromise: (value: boolean) => void
  private writtenToLog: string[] = []
  private readonly sendAllMessages: boolean

  constructor(filenameRoot: string, localConfig: any, globalConfig: ConfigService) {
    super(filenameRoot, localConfig, globalConfig)
    this._logger = new Logger(this.name)
    this.hassWsUrl = this.getConfig('hassWsUrl', '')
    this.accessToken = this.getConfig('accessToken', '')
    this.accessToken = this.getConfig('accessToken', '')
    this.debug = true
    this.sendAllMessages = this.getConfig('sendAllMessages', false)
    readFile(logFilePath)
      .then(buffer => {
        const lines = buffer.toString().split('\r\n')
        this.writtenToLog = lines.filter(l => l.length > 5).map(l => first(l.split(';')) ?? '')
      })
      .catch(error => {
        if (error.code !== 'ENOENT') {
          console.error(error)
          debugger
        }
      })
  }

  async start() {
    this.logDebug(`Connecting to websocket ${this.hassWsUrl}`)
    const promise = new Promise<boolean>(resolve => (this.startPromise = resolve))
    this.ws = new WebSocket(this.hassWsUrl)
    this.ws.on('error', console.error)
    this.ws.on('message', (buf: Buffer) => {
      if (buf.toString().includes('result')) console.log(buf.toString())
      this.processIncomingMessage(JSON.parse(buf.toString()))
    })
    DriverBase.eventEmitter.on('command.light', data => this.changeLight(data))
    return promise
  }
  async stop() {}

  entityFrom(nativeMessage: IncomingMessage): string | undefined {
    if (nativeMessage.type.startsWith('auth')) return undefined
    if (nativeMessage.type === 'event') return nativeMessage.event.data.entity_id
    if (nativeMessage.type === 'result' && nativeMessage.result === null) return undefined
    console.error(`Add to entityFrom(): ${JSON.stringify(nativeMessage)}`)
    return undefined
  }

  changeLight(data: { entity: string; onOff: LightOnoffState }) {
    const msg = {
      id: this.cmdIdCounter++,
      type: 'call_service',
      domain: 'light',
      service: `turn_${data.onOff}`,
      // Optional
      // "service_data": {
      //   "color_name": "beige",
      //   "brightness": "101"
      // }
      // Optional
      target: {
        entity_id: 'light.keuken_2',
      },
    }
    this.ws.send(JSON.stringify(msg))
    console.log(JSON.stringify(msg))
  }

  private processIncomingMessage(data: IncomingMessage) {
    const entity = this.entityFrom(data)
    switch (data.type) {
      case 'auth_required':
        this.logDebug(`Connected to HASS ${data.ha_version ?? ''}, attempting logon`)
        this.sendToHass({ type: 'auth', access_token: this.accessToken })
        break
      case 'auth_ok':
        this.logDebug(`Logon succeeded`)
        this.sendToHass({ id: this.cmdIdCounter++, type: 'subscribe_events', event_type: 'state_changed' })
        this.startPromise(true)
        break
      case 'auth_invalid':
        this._logger.error(`Logon Failed - ${data.message}`)
        this.startPromise(false)
        break
      default:
        if (entity && !this.writtenToLog.includes(entity)) {
          appendFile(logFilePath, entity + ';' + JSON.stringify(data) + '\r\n')
          this.writtenToLog.push(entity)
        }
        if (entity) {
          if (!entity) return // don't process if entity returns undefined
          const transformed = this.transformKnownMessageContent(data)
          if (!transformed) {
            if (this.sendAllMessages) this.sendMessage(entity, { ...data, timestamp: new Date() })
          } else this.sendMessage(transformed.entity, transformed.content)
        }
        break
    }
  }

  //TODO !! test entity blocking/selecting before message transformation
  transformKnownMessageContent(natMsg: any): { entity: string; content: IMessageContent } | undefined {
    if (natMsg.type === 'event') {
      const timestamp = utcToLocal(natMsg.event?.data?.new_state.last_updated)
      const entity = (natMsg.event?.data?.entity_id as string) ?? '-=unknown=-'
      const entityTypeTuple = this.entityTypes.find(et => et.entity === entity)
      if (!entityTypeTuple) return undefined
      let content: KnownContent | undefined = undefined
      // extract common states
      const oldOnoffState = natMsg.event?.data?.old_state.state ?? 'off'
      const newOnoffState = natMsg.event?.data?.new_state.state ?? 'off'

      switch (entityTypeTuple.type) {
        case 'motionDetectors':
          content = new PresenceStateUpdate(
            natMsg.event?.data?.new_state.state === 'on' ? 'present' : 'absent',
            timestamp,
          )
          return { entity: entityTypeTuple.outEntity, content }
        case 'doorContacts':
          content = new OpenCloseStateUpdate(newOnoffState == 'on' ? 'open' : 'closed', timestamp)
          return { entity: entityTypeTuple.outEntity, content }
        case 'lights':
          const oldDimState = natMsg.event?.data?.old_state.attributes.brightness ?? 0
          const newDimState = natMsg.event?.data?.new_state.attributes.brightness ?? 0
          if (oldOnoffState !== newOnoffState) {
            content = new LightOnoffStateUpdate(newOnoffState == 'on' ? 'on' : 'off', timestamp)
          }
          if (!content && oldDimState !== newDimState) {
            content = new LightDimStateUpdate(newDimState)
          }
          return !content ? undefined : { entity: entityTypeTuple.outEntity, content }
      }

      // default valueUpdate
      const event: EventInfo = natMsg.event
      const newState = event.data?.new_state.state
      const numberState = isNaN(parseFloat(newState)) ? undefined : parseFloat(newState)
      const unit = event.data.new_state.attributes.unit_of_measurement ?? ''
      return { entity, content: new ValueStateUpdate(newState, unit, numberState) }
    }
    return undefined
  }

  private sendToHass(msg: OutgoingMessage) {
    this.ws.send(JSON.stringify(msg))
  }
}
