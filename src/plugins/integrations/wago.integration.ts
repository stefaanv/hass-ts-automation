import * as udp from 'dgram'
import { differenceInMilliseconds } from 'date-fns'
import { IntegrationBase } from '@src/infrastructure/loadable-base-classes/integration.base'
import { ConfigService } from '@nestjs/config'
import { PlcConfig } from './wago/plc.config.model'
import { ButtonReleased } from '@infrastructure/messages/events/button-release.model'
import { ButtonPressed } from '@infrastructure/messages/events/button-press.model'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ensureError } from '@bruyland/utilities'
import { Message } from '@src/infrastructure/messages/message.model'

const WAGO_PORT = 1202
export interface WagoIntegrationDebugInfo {
  lastMsgReceivedFrom: Record<string, string>
  lastUdpPacket: {
    cobId: number
    receivedAt: string
  }
  lastStateChanges: Record<string, string>
}
const ID = 'wago-nv'
export default class WagoIntegration extends IntegrationBase {
  public readonly name = 'Wago Network Variables'
  public readonly version = '0.0.1'
  public readonly id = ID

  private _server: udp.Socket
  private _controller = new AbortController()
  private _states: Record<string, boolean> = {}
  private _buttonPressStarts: Record<string, Date> = {}
  private _debugInfo: WagoIntegrationDebugInfo
  private _plcs: PlcConfig[]
  private _startAddress: number

  constructor(
    _integrationFileName: string, // first part of the filename of the driver,
    _eventEmitter: EventEmitter2,
    localConfig: any, // content of the config file with the same name as the driver file
    globalConfig: ConfigService,
  ) {
    // general setup
    super(ID, _eventEmitter, localConfig, globalConfig)
    this._debugInfo = { lastMsgReceivedFrom: {}, lastStateChanges: {} } as WagoIntegrationDebugInfo

    // get the configuration
    const plcs = this.getConfig<PlcConfig[]>('plcs', [] as PlcConfig[])

    this._states = Object.fromEntries(
      plcs.flatMap(plc => Object.values(plc.switches)).map(name => [name, false]),
    )

    this._plcs = plcs
    this._startAddress = this.getConfig<number>('addressStart', 0)

    this._server = udp.createSocket({ type: 'udp4' })
  }

  override async start(): Promise<boolean> {
    // set up the UDP listener
    try {
      this._server.bind(WAGO_PORT)
      this.setUdpListeners()
      return true
    } catch (error) {
      this._log.error(ensureError(error).message)
      return false
    }
  }

  override async stop() {
    this._server.close()
  }

  override handleInternalMessage(message: Message): void {
    // Do nothing
  }

  private setUdpListeners() {
    this._server.on('listening', () => {
      const address = this._server.address()
      this._log.log(`WAGO Server is listening at ${address.port}`)
    })

    this._server.on('message', (buffer, msg) => {
      this.diff(buffer)
    })

    this._server.on('error', error => {
      console.error('Error: ' + error)
      this._server.close()
      this._controller.abort()
    })
  }

  public get debugInfo() {
    return this._debugInfo
  }

  public get configInfo() {
    return {
      plcs: this._plcs,
      server: this._server.address(),
    }
  }

  diff(buffer: Buffer) {
    const now = new Date()
    const nowStr = now.toLocaleString()
    const cobId = buffer[9] * 256 + buffer[8]
    this._debugInfo.lastUdpPacket = { cobId, receivedAt: nowStr }
    const plc = this._plcs.find(sc => sc.cobId === cobId)
    if (!plc) return
    this._debugInfo.lastMsgReceivedFrom[plc.name] = nowStr
    for (const subAddress of Object.keys(plc.switches).map(x => parseInt(x))) {
      const newState = buffer.readUInt8(this._startAddress + subAddress) === 1
      const switchName = plc.switches[subAddress]
      const oldState = this._states[switchName]
      if (newState !== oldState) {
        if (newState) {
          // this.emit<'pressed'>('pressed', switchName)
          // console.log('pressed', switchName)
          this._buttonPressStarts[switchName] = now
          this.sendInternalMessage(new ButtonPressed(this.id, switchName, undefined))
        } else {
          // console.log('released', switchName)
          const start = this._buttonPressStarts[switchName] ?? now
          const duration = differenceInMilliseconds(now, start)
          this.sendInternalMessage(new ButtonReleased(this.id, switchName, { duration }))
        }
        this._states[switchName] = newState
        this._debugInfo.lastStateChanges[plc.name + '-' + switchName] = nowStr
      }
    }
  }
}
