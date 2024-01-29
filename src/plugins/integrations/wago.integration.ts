import * as udp from 'dgram'
import { differenceInMilliseconds } from 'date-fns'
import { IntegrationBase } from '@architecture/integration.base'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import { PlcClusterConfig, PlcConfig } from './wago/plc.config.model'
import { Entity } from '@architecture/entities/entity.model'
import { ButtonReleased } from '@architecture/messages/events/button-release.model'
import { ButtonPressed } from '@architecture/messages/events/button-press.model'

const WAGO_PORT = 1202
export interface WagoIntegrationDebugInfo {
  lastMsgReceivedFrom: Record<string, string>
  lastUdpPacket: {
    cobId: number
    receivedAt: string
  }
  lastStateChanges: Record<string, string>
}

export default class WagoIntegration extends IntegrationBase {
  public readonly name = 'Wago Network Variables'
  public readonly version = '0.0.1'
  public readonly id = 'wago-nv'

  private _server: udp.Socket
  private _controller = new AbortController()
  private _states: Record<string, boolean> = {}
  private _buttonPressStarts: Record<string, Date> = {}
  private _config: PlcClusterConfig
  private _debugInfo: WagoIntegrationDebugInfo
  private _plcs: PlcConfig[]
  private _startAddress: number

  constructor(
    _driverFileName: string, // first part of the filename of the driver
    localConfig: any, // content of the config file with the same name as the driver file
    globalConfig: ConfigService,
  ) {
    // general setup
    super(localConfig, globalConfig)
    this._log = new Logger(WagoIntegration.name)
    this._debugInfo = { lastMsgReceivedFrom: {}, lastStateChanges: {} } as WagoIntegrationDebugInfo

    // get the configuration
    const config = this.getConfig<PlcClusterConfig>('', {} as PlcClusterConfig)
    this.entities = config.plcs.flatMap(plc =>
      Object.entries(plc.switches).map(([k, v]) => new Entity({ name: v, type: 'button' })),
    )
    this._plcs = config.plcs
    this._startAddress = config.addressStart

    // set up the UDP listener
    this._server = udp.createSocket({ type: 'udp4' })
    this._server.bind(WAGO_PORT)
    this.setUdpListeners()
  }

  override async start(): Promise<boolean> {
    return super.reportStarted()
  }

  override async stop() {
    super.reportStopped()
  }

  private setUdpListeners() {
    this._server.on('listening', () => {
      const address = this._server.address()
      const port = address.port
      console.log('WAGO Server is listening at port ' + port)
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

  diff(buffer: Buffer) {
    // console.log(buffer)
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
          this.sendMessage(new ButtonPressed(this.id, switchName))
        } else {
          // console.log('released', switchName)
          const start = this._buttonPressStarts[switchName] ?? now
          const duration = differenceInMilliseconds(now, start)
          this.sendMessage(new ButtonReleased(this.id, switchName, duration))
        }
        this._states[switchName] = newState
        this._debugInfo.lastStateChanges[plc.name + '-' + switchName] = nowStr
      }
    }
  }
}
