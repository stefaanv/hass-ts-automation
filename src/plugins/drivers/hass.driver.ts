import * as WebSocket from 'ws'
import { EventInfo, IncomingMessage, OutgoingMessage } from './hass/hass-message.types'
import { DriverBase } from '@src/architecture/driver.base'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import { MultiRegex, utcToLocal } from '@src/utilities'
import { IMessageContent } from '@src/architecture/message.model'
import { ValueStateUpdate } from '@src/architecture/known-content/value-state-update.model'
import { appendFile, readFile } from 'fs/promises'
import {
  LightOnoffStateUpdate,
  PresenceStateUpdate,
} from '@src/architecture/known-content/enum-state-update.models'
import { LightDimStateUpdate } from '@src/architecture/known-content/single-value-update.models'
import { first } from 'radash'

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
  private readonly throttleFilter: MultiRegex
  private readonly throttleCounters: Record<string, number> = {}
  private readonly throttleAmount = 10
  private writtenToLog: string[] = []

  constructor(filenameRoot: string, localConfig: any, globalConfig: ConfigService) {
    super(filenameRoot, localConfig, globalConfig)
    this._logger = new Logger(this.name)
    this.hassWsUrl = this.getConfig('hassWsUrl', '')
    this.accessToken = this.getConfig('accessToken', '')
    this.debug = true
    this.throttleFilter = new MultiRegex(this.getConfig<RegExp[]>('throttleFilter', []))
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
      this.processIncomingMessage(JSON.parse(buf.toString()))
    })
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
        if (entity && this.throttle(entity)) {
          if (!entity) return // don't process if entity returns undefined
          const transformed = this.transformKnownMessageContent(data)
          if (!transformed) this.sendMessage(entity, { ...data, timestamp: new Date() })
          else this.sendMessage(transformed.entity, transformed.content)
        }
        break
    }
  }

  //TODO !! test entity blocking/selecting before message transformation
  transformKnownMessageContent(natMsg: any): { entity: string; content: IMessageContent } | undefined {
    if (natMsg.type === 'event') {
      const timestamp = utcToLocal(natMsg.event?.data?.new_state.last_updated)
      const natEntity = (natMsg.event?.data?.entity_id as string) ?? '-=unknown=-'
      const friendlyName = (
        (natMsg.event?.data?.new_state?.attributes?.friendly_name as string) ?? ''
      ).toLowerCase()
      const entity = natEntity

      if (natMsg.event?.data?.new_state.attributes?.device_class === 'motion') {
        const presence = natMsg.event?.data?.new_state.state === 'on' ? 'present' : 'absent'
        const outEntity = entity.replace(/^binary_sensor\./, '')
        return {
          entity: outEntity,
          content: new PresenceStateUpdate(presence, timestamp),
        }
      }

      if ((natMsg.event?.data?.entity_id ?? '').startsWith('light')) {
        const oldOnoffState = natMsg.event?.data?.old_state.state ?? 'off'
        const newOnoffState = natMsg.event?.data?.new_state.state ?? 'off'
        const oldDimState = natMsg.event?.data?.old_state.attributes.brightness ?? 0
        const newDimState = natMsg.event?.data?.new_state.attributes.brightness ?? 0
        const outEntity = entity.replace(/^light\./, '')

        if (oldOnoffState !== newOnoffState) {
          return {
            entity: outEntity,
            content: new LightOnoffStateUpdate(newOnoffState == 'on' ? 'on' : 'off', timestamp),
          }
        }
        if (oldDimState !== newDimState) {
          return {
            entity: outEntity,
            content: new LightDimStateUpdate(newDimState),
          }
        }
      }

      if ((natMsg.event?.data?.entity_id ?? '').startsWith('binary-switch')) {
        const oldOnoffState = natMsg.event?.data?.old_state.state ?? 'off'
        const newOnoffState = natMsg.event?.data?.new_state.state ?? 'off'
        const outEntity = entity.replace(/^light\./, '')

        // if (oldOnoffState !== newOnoffState) {
        //   return {
        //     entity: outEntity,
        //     content: new OpenCloseStateUpdate(newOnoffState == 'on' ? 'on' : 'off', timestamp),
        //   }
        // }
      }

      // default valueUpdate
      const event: EventInfo = natMsg.event
      const newState = event.data?.new_state.state
      const numberState = isNaN(parseFloat(newState)) ? undefined : parseFloat(newState)
      const unit = event.data.new_state.attributes.unit_of_measurement ?? ''
      const content = new ValueStateUpdate(newState, unit, numberState)
      return { entity, content }
    }
    return undefined
  }

  throttle(entity: string) {
    if (!this.throttleFilter.test(entity)) return true
    const counter = this.throttleCounters[entity]
    if (counter === undefined || counter === this.throttleAmount) {
      this.throttleCounters[entity] = 0
      return true
    }
    this.throttleCounters[entity]++
    return false
  }

  private sendToHass(msg: OutgoingMessage) {
    this.ws.send(JSON.stringify(msg))
  }
}
