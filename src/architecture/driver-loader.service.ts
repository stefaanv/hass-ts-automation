import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { Driver, DriverSchema } from './driver.model'
import { tryit } from 'radash'
import { EventEmitter2 } from 'eventemitter2'
import { ConfigService } from '@nestjs/config'
import { white } from 'ansi-colors'
import { readdirSync } from 'fs'
import { resolve } from 'path'

@Injectable()
export class DriverLoader {
  private readonly _drivers: Driver[] = []
  private readonly _log: LoggerService

  constructor(
    private readonly _config: ConfigService,
    private readonly _eventEmitter: EventEmitter2,
  ) {
    this._log = new Logger(DriverLoader.name)
    setTimeout(() => this.load(), 1000)
  }

  async load() {
    this._log.log(`Loading drivers`)
    const driverFolder = this._config.get('driverFolder', '')
    const driverExtension = this._config.get('driverExtension', '.js')
    const files = readdirSync(driverFolder, { recursive: false, withFileTypes: false })
      .map(buffer => buffer.toString())
      .filter(f => f.endsWith(driverExtension))
    for (const file of files) {
      const driverFullPath = resolve(driverFolder, file)
      const driverClass = (await import(driverFullPath)).default
      const driverInstance: Driver = new driverClass()
      const [error] = tryit(DriverSchema.parse)(driverInstance)
      if (error) {
        this._log.error(`Unable to load TestDriver - ${error.message}}`)
        this._log.debug!(error)
      } else {
        this._log.log(`Driver ${driverInstance.name} v${driverInstance.version} loaded`)
        this._drivers.push(driverInstance)
        driverInstance.start({}, this._config, this._eventEmitter)
        this._log.log(white(`Driver ${driverInstance.name} started`))
      }
    }
  }
}
