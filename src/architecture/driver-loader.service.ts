import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { IDriver, DriverConstructorSchema, DriverSchema } from './driver.base'
import { tryit } from 'radash'
import { EventEmitter2 } from 'eventemitter2'
import { ConfigService } from '@nestjs/config'
import { red, white } from 'ansi-colors'
import { readdirSync } from 'fs'
import { resolve } from 'path'

const tryImport = tryit(async (file: string) => import(file))

@Injectable()
export class DriverLoader {
  private readonly _drivers: IDriver[] = []
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
    const driverExtension = this._config.get('driverExtension', '.driver.js')
    const configExtension = this._config.get('configExtension', '.config.js')
    const allFiles = readdirSync(driverFolder, { recursive: false, withFileTypes: false }).map(buffer =>
      buffer.toString(),
    )
    const driverFiles = allFiles.filter(f => f.endsWith(driverExtension))
    const configFiles = allFiles.filter(f => f.endsWith(configExtension))

    const stripRegex = new RegExp(`\\${driverExtension}$`)
    for (const filename of driverFiles) {
      const filenameRoot = filename.replace(stripRegex, '')
      const configFilename = filenameRoot + configExtension
      let localConfig = {}
      if (configFiles.includes(configFilename)) {
        const configFullPath = resolve(driverFolder, configFilename)
        const [error0, config] = await tryImport(configFullPath)
        if (error0) {
          this._log.warn(`Unable to load local config file ${configFilename} - ${error0.message}}`)
        } else {
          localConfig = config.default
        }
      }
      const driverFullPath = resolve(driverFolder, filename)
      const [error1, dcImp] = await tryImport(driverFullPath)
      const driverClass = dcImp.default
      const [error2] = tryit(DriverConstructorSchema.parse)(driverClass)
      if (error1 || error2) {
        const error = error1 ?? error2
        this._log.error(`Driver ${filenameRoot} constructor is incorrect - ${error!.message}}`)
        return
      }
      const driverInstance: IDriver = new driverClass(filenameRoot, localConfig, this._config)
      const [error3] = tryit(DriverSchema.parse)(driverInstance)
      if (error3) {
        this._log.error(`Driver ${filenameRoot} class has incorrect form - ${error3.message}}`)
        this._log.debug!(error3)
        return
      }
      this._log.log(`Driver ${driverInstance.name} v${driverInstance.version} loaded`)
      const started = await driverInstance.start(this._eventEmitter)
      if (started) {
        this._drivers.push(driverInstance)
        this._log.log(white(`Driver ${driverInstance.name} started`))
      } else {
        this._log.error(red(`Unable to start ${driverInstance.name} driver`))
      }
    }
  }
}
