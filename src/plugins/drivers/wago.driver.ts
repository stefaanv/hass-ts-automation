import * as udp from 'dgram'
import { differenceInMilliseconds } from 'date-fns'
import { DriverBase } from '@src/architecture/driver.base'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import { PlcClusterConfig } from './wago/plc.config.model'
import { Entity } from '@src/architecture/entities/entity.model'

const WAGO_PORT = 1202

export default class WagoDriver extends DriverBase {
  public name = 'Wago Network Variables'
  public version = '0.0.1'
  public id = 'wago'

  private _server: udp.Socket
  private _controller = new AbortController()
  private _states: Record<string, boolean>
  private _config: PlcClusterConfig

  constructor(
    driverFileName: string, // first part of the filename of the driver
    localConfig: any, // content of the config file with the same name as the driver file
    globalConfig: ConfigService,
  ) {
    // general setup
    super(localConfig, globalConfig)
    this._log = new Logger(WagoDriver.name)

    // load this configuration
    //TODO gaat dit ook bij global config ?
    this._config = this.getConfig<PlcClusterConfig>('', {} as PlcClusterConfig)
    this.entities = this._config.plcs.flatMap(plc =>
      Object.entries(plc.switches).map(([k, v]) => new Entity({ name: v, type: 'button' })),
    )

    // set up the UDP listener
    this._server = udp.createSocket({ type: 'udp4' })
    this._server.bind(WAGO_PORT)
    this.setUdpListeners()
  }

  private setUdpListeners() {
    this._server.on('listening', () => {
      const address = this._server.address()
      const port = address.port
      console.log('WAGO Server is listening at port ' + port)
    })

    this._server.on('message', (buffer, msg) => {
      // const changes = this.diff(buffer)
    })

    this._server.on('error', error => {
      console.error('Error: ' + error)
      this._server.close()
      this._controller.abort()
    })
  }

  diff(buffer: Buffer) {
    // console.log(buffer)
    const cobId = buffer[9] * 256 + buffer[8]
    const plc = this._config.plcs.find(sc => sc.cobId === cobId)
    if (!plc) return
    for (const subAddress of Object.keys(plc.switches).map(x => parseInt(x))) {
      const newState = buffer.readUInt8(this._config.addressStart + subAddress) === 1
      const switchName = plc.switches[subAddress]
      const oldState = this._states[switchName]
      if (newState !== oldState) {
        if (newState) {
          // this.emit<'pressed'>('pressed', switchName)
          console.log('pressed', switchName)
          this._states[switchName] = newState
        } /*else {
          const duration = differenceInMilliseconds(new Date(), oldState.pressStart!)
          this._states[switchName] = { state: newState, pressStart: undefined }
          this.emit<'released'>('released', switchName, duration)
        }*/
      }
    }
  }

  override async start(): Promise<boolean> {
    return super.reportStarted()
  }

  override async stop() {
    super.reportStopped()
  }
}
