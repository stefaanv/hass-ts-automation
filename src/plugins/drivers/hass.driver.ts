import * as WebSocket from 'ws'
import { EventInfo, IncomingMessage, OutgoingMessage } from './hass/hass-message.types'
import { DriverBase } from '@src/architecture/driver.base'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import { MultiRegex } from '@src/utilities'
import { IMessageContent, Message } from '@src/architecture/message.model'
import { ValueStateUpdate } from '@src/architecture/known-messages/value-state-update.model'
import { PresenceStateUpdate } from '@src/architecture/known-messages/presence-update.model'
import { parseISO } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'

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

  constructor(filenameRoot: string, localConfig: any, globalConfig: ConfigService) {
    super(filenameRoot, localConfig, globalConfig)
    this._logger = new Logger(this.name)
    this.hassWsUrl = this.getConfig('hassWsUrl', '')
    this.accessToken = this.getConfig('accessToken', '')
    this.debug = true
    this.throttleFilter = new MultiRegex(this.getConfig<RegExp[]>('throttleFilter', []))
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
        if (entity && this.throttle(entity)) {
          const entity = this.entityFrom(data)
          if (!entity) return // don't process if entity returns undefined
          const transformed = this.transformKnownMessageContent(data)
          this.sendMessage(entity, transformed ? transformed : { ...data, timestamp: new Date() })
        }
        break
    }
  }

  //TODO !! test entity blocking/selecting before message transformation
  transformKnownMessageContent(natMsg: any): IMessageContent | undefined {
    if (natMsg.type === 'event' && natMsg.event?.data?.new_state.attributes?.device_class === 'motion') {
      const timestamp = utcToZonedTime(
        parseISO(natMsg.event?.data?.new_state.last_updated),
        'Europe/Brussels',
      )
      const presence = natMsg.event?.data?.new_state.state === 'on' ? 'present' : 'absent'
      return new PresenceStateUpdate(presence, timestamp)
    }
    if (natMsg.type === 'event') {
      const event: EventInfo = natMsg.event
      const newState = event.data?.new_state.state
      const numberState = isNaN(parseFloat(newState)) ? undefined : parseFloat(newState)
      const unit = event.data.new_state.attributes.unit_of_measurement ?? ''
      const content = new ValueStateUpdate(newState, unit, numberState)
      return content
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
