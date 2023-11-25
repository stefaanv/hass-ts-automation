import WebSocket from 'ws'
import { EventInfo, IncomingMessage, OutgoingMessage } from './hass/hass-message.types'
import { Driver, IDriver } from '@src/architecture/driver.model'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
const hassUrl = process.env.HASS_URL
const access_token = process.env.ACCESS_TOKEN || ''

export default class TestDriver extends Driver {
  public readonly name = 'Home Assistant'
  public readonly version = '0.0.1'
  private readonly authAttempts = 0
  private readonly cmdIdCounter = 1
  private readonly ws: WebSocket
  private readonly started = false
  private readonly hassWsUrl: string

  constructor(localConfig: any, globalConfig: ConfigService) {
    super(localConfig, globalConfig)
    this.hassWsUrl = this.getConfig('hassWsUrl', '')
  }

  async start(emitter: EventEmitter2) {
    this._logger.warn(this.hassWsUrl)
    return true
  }
  async stop() {}
}

/*
const ws = new WebSocket('ws://192.168.0.3:8123/api/websocket')
ws.on('error', console.error)

ws.on('open', function open() {
  console.log('connection opened')
})

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
