import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { Driver, DriverSchema } from './driver.model'
import { tryit } from 'radash'
import { EventEmitter2 } from 'eventemitter2'
import { ConfigService } from '@nestjs/config'
import { whiteBright } from 'ansi-colors'
import { readdirSync } from 'fs'

@Injectable()
export class DriverLoader {
  private readonly _drivers: Driver[]
  private readonly _log: LoggerService

  constructor(
    private readonly _config: ConfigService,
    private readonly _eventEmitter: EventEmitter2,
  ) {
    this._log = new Logger(DriverLoader.name)
    this._log.log(whiteBright('test logging'))
    this._log.log(`loading drivers`)
    this.load()
  }

  async load() {
    const driverFolder = this._config.get('driverFolder', '')
    const files = readdirSync(driverFolder).filter(f => f.endsWith('.js'))
    console.log(files)
    const driverClass = (await import(driverFolder)).default
    const driverInstance: Driver = new driverClass()
    const [error, result] = tryit(DriverSchema.parse)(driverInstance)
    if (error) {
      this._log.error(`Unable to load TestDriver - ${error.message}}`)
      this._log.debug!(error)
    } else {
      this._log.log(`Driver ${driverInstance.name} v${driverInstance.version} loaded`)
      this._drivers.push(driverInstance)
      driverInstance.start({}, this._config, this._eventEmitter)
      this._log.log(`Driver ${driverInstance.name} started`)
    }
    driverInstance.stop()
  }
}
