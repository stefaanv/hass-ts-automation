import { Injectable, LoggerService } from '@nestjs/common'
import { Driver, DriverSchema } from './driver.model'
import { tryit } from 'radash'
import { EventEmitter2 } from 'eventemitter2'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class DriverLoader {
  private readonly _drivers: Driver[]

  constructor(
    private readonly _config: ConfigService,
    private readonly _log: LoggerService,
    private readonly _eventEmitter: EventEmitter2,
  ) {}

  async load() {
    const testDriverPath = '../plugins/drivers/test.driver'
    const driverClass = (await import(testDriverPath)).default
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
