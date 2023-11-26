import * as WebSocket from 'ws'
import { EventInfo, IncomingMessage, OutgoingMessage } from './hass/hass-message.types'
import { DriverBase } from '@src/architecture/driver.base'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import { SensorState, SensorStateUpdate } from '@src/architecture/known-messages/sensor.model'
import { MultiRegex } from '@src/utilities'
import { Message } from '@src/architecture/message.model'

export default class HassDriver extends DriverBase {
  public readonly name = 'Home Assistant'
  public readonly version = '0.0.1'
  public readonly id = 'hass'
  private cmdIdCounter = 1
  private ws: WebSocket
  private readonly started = false
  private readonly hassWsUrl: string
  private readonly accessToken: string
  private startPromise: (value: boolean) => void
  private readonly throttleFilter: MultiRegex
  private readonly throttleCounters: Record<string, number> = {}
  private readonly throttleAmount = 10

  get origin() {
    return `driver.${this.id}`
  }

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
        this.send({ type: 'auth', access_token: this.accessToken })
        break
      case 'auth_ok':
        this.logDebug(`Logon succeeded`)
        this.send({ id: this.cmdIdCounter++, type: 'subscribe_events', event_type: 'state_changed' })
        this.startPromise(true)
        break
      case 'auth_invalid':
        this._logger.error(`Logon Failed - ${data.message}`)
        this.startPromise(false)
        break
      default:
        if (entity && this.throttle(entity)) {
          const transformed = this.transformKnownMessage(entity, data)
          this.handleIncomingMessage(transformed)
        }
        // this.processStateChangedEvents(entity!, data)
        break
    }
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

  transformKnownMessage(entity: string, nativeMessage: any): Message {
    let content = nativeMessage
    if (nativeMessage.type === 'event') {
      const event: EventInfo = nativeMessage.event
      const nativeEntity = event.data?.entity_id
      const newState = event.data?.new_state.state
      const numberState = isNaN(parseFloat(newState)) ? undefined : parseFloat(newState)
      const unit = event.data.new_state.attributes.unit_of_measurement ?? ''
      content = new SensorState(newState, unit, numberState)
    }
    return new Message(this.origin, entity, content)
  }

  private send(msg: OutgoingMessage) {
    this.ws.send(JSON.stringify(msg))
  }
}

/*

ws.on('message', function message(buf: Buffer) {
  const data: IncomingMessage = JSON.parse(buf.toString())
  switch (data.type) {
    case 'auth_required':
      send({ type: 'auth', access_token })
      break
    case 'auth_ok':
      send({ id: cmdIdCounter++, type: 'subscribe_events', event_type: 'state_changed' })
      break
    case 'result':
      if (!data.success) {
        console.error(data.error)
        return
      }
      console.log(data)
      break
    case 'event':
      printEvent(data.event)
      break
    default:
      console.log(data)
      break
  }
})

function send(msg: OutgoingMessage) {
  ws.send(JSON.stringify(msg))
}

function printEvent(event: EventInfo) {
  const eventData: any = event.data.new_state
  const newState = eventData.state + (eventData.attributes.unit_of_measurement ?? '')
  delete eventData.entity_id
  delete eventData.context
  delete eventData.last_changed
  delete eventData.last_updated
  delete eventData.state
  delete eventData.attributes.unit_of_measurement
  delete eventData.attributes.friendly_name
  if (
    !event.data.entity_id.match(
      /^sensor.power|^sensor.voltage|^sensor.current|^media_player|^sensor.inverter_pv|^sensor.slimmelezer/,
    )
  )
    console.log(`${event.data.entity_id} => ` + `${newState}` + ` ${JSON.stringify(eventData)}`)
}
*/