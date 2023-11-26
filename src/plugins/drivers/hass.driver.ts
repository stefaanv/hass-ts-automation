import * as WebSocket from 'ws'
import { EventInfo, IncomingMessage, OutgoingMessage } from './hass/hass-message.types'
import { Driver } from '@src/architecture/driver.model'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Logger } from '@nestjs/common'
import { SensorStateUpdateEvent } from '@src/architecture/sensor.model'
import { tryit } from 'radash'

export default class TestDriver extends Driver {
  public readonly name = 'Home Assistant'
  public readonly version = '0.0.1'
  public readonly id = 'hass'
  private authAttempts = 0
  private cmdIdCounter = 1
  private ws: WebSocket
  private readonly started = false
  private readonly hassWsUrl: string
  private readonly accessToken: string
  private startPromise: (value: boolean) => void
  private readonly blockFilter: RegExp
  private _eventEmitter: EventEmitter2

  constructor(filenameRoot: string, localConfig: any, globalConfig: ConfigService) {
    super(filenameRoot, localConfig, globalConfig)
    this._logger = new Logger(this.name)
    this.hassWsUrl = this.getConfig('hassWsUrl', '')
    this.accessToken = this.getConfig('accessToken', '')
    this.debug = true
  }

  async start(emitter: EventEmitter2) {
    this._eventEmitter = emitter
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
    if (nativeMessage.type === 'result') {
      console.error(`Add to entityFrom(): ${JSON.stringify(nativeMessage.result)}`)
      return undefined
    }
  }

  private processIncomingMessage(data: IncomingMessage) {
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
      case 'event':
        this.processStateChangedEvents(data.event, data.id)
        break
      case 'result':
        console.log(`result ${data.id} - ${data.success ? 'success' : 'FAILED'}`)
        break
      default:
        console.error('Unknown message type')
        console.log(data)
        break
    }
  }

  private processStateChangedEvents(data: EventInfo, id: number) {
    const nativeEntity = data.data?.entity_id
    const newState = data.data?.new_state.state
    const numberState = isNaN(parseFloat(newState)) ? undefined : parseFloat(newState)
    const unit = data.data.new_state.attributes.unit_of_measurement ?? ''
    if (nativeEntity.match(this.blockFilter)) return
    const entity = nativeEntity.replace(/^sensor\./, '')
    const payload: SensorStateUpdateEvent = {
      originatingDriver: this.id,
      entity,
      nativeEntity,
      history: [],
      lastStateChange: new Date(),
      state: newState,
      numberState,
      unit,
    }
    this._eventEmitter.emit('sensor.state', payload)
    // console.log(`${entityId} -> ${newState} ${unit}`)
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
