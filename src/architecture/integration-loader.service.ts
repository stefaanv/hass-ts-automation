import { Injectable, Logger, LoggerService, NotImplementedException } from '@nestjs/common'
import { IntegrationBase } from './integration.base'
import { isLeft, isRight, left, right, tryit } from '@bruyland/utilities'
import { EventEmitter2 } from 'eventemitter2'
import { ConfigService } from '@nestjs/config'
import { red, white } from 'ansi-colors'
import { readdirSync } from 'fs'
import { resolve } from 'path'
import { LoadableConstructorSchema, LoadableSchema } from './loadable'

const tryImport = tryit(async (file: string) => import(file))

@Injectable()
export class IntegrationLoader {
  private readonly _integrations: IntegrationBase[] = []
  private readonly _log: LoggerService

  constructor(
    private readonly _config: ConfigService,
    private readonly _eventEmitter: EventEmitter2,
  ) {
    this._log = new Logger(IntegrationLoader.name)
    IntegrationBase.eventEmitter = _eventEmitter
    setTimeout(() => this.loadIntegrations(), 1000)
  }

  async loadIntegrations() {
    const integrationsfolder = this._config.get('integrationsfolder', '')
    const integrationExtension = this._config.get('integrationExtension', '.integration.js')
    const configExtension = this._config.get('configExtension', '.config.js')
    const allFiles = readdirSync(integrationsfolder, {
      recursive: true,
      withFileTypes: false,
      encoding: 'utf-8',
    })
    const driverFiles = allFiles.filter(f => f.endsWith(integrationExtension))
    const configFiles = allFiles.filter(f => f.endsWith(configExtension))

    this._log.log(`Start loading ${driverFiles.length} drivers`)
    const stripRegex = new RegExp(`\\${integrationExtension}$`)
    // for every driver
    for (const filename of driverFiles) {
      // deduce the name of the config file (e.g. myDriver.driver.js -> myDriver.config.js)
      const configFilename = filename.replace(stripRegex, configExtension)
      let localConfig = {} // localConfig default in case of no config file or erors
      // try import the local config file
      if (configFiles.includes(configFilename)) {
        const configFullPath = resolve(integrationsfolder, configFilename)
        const either = await tryImport(configFullPath)
        if (isLeft(either)) {
          this._log.warn(`Unable to load local config file ${configFilename} - ${left(either).message}}`)
        } else {
          localConfig = right(either).default
        }
      }

      const driverFullPath = resolve(integrationsfolder, filename)
      const either = await tryImport(driverFullPath)
      if (isRight(either)) {
        // load the driver
        const driverClass = right(either).default
        // Check if the driver class has the correct form
        const [error1] = tryit(LoadableConstructorSchema.parse)(driverClass)
        if (error1) {
          this._log.error(`Driver ${filename} constructor is incorrect - ${error1.message}}`)
          return
        }

        // try instantiating the driver
        const driverInstance: IntegrationBase = new driverClass(filename, localConfig, this._config)
        const [error2] = tryit(LoadableSchema.parse)(driverInstance)
        if (error2) {
          this._log.error(`Driver ${filename} class has incorrect form - ${error2.message}}`)
          this._log.debug!(error2)
          return
        }

        this._log.log(`Driver ${white(driverInstance.name)} v${driverInstance.version} loaded`)
        this._log.debug!(`Entities: ${driverInstance.entities.join(', ')}`)

        // try to start the driver
        const started = await driverInstance.start() // TODO handle possible errors
        if (started) {
          this._integrations.push(driverInstance)
          // this._log.log(`${driverInstance.name} ` + yellow('started'))
        } else {
          this._log.error(red(`Unable to start ${driverInstance.name} driver`))
        }
      } else {
        //TODO
        throw new NotImplementedException('driver-loader-service loadIntegrations 2nd part else')
      }
    }
  }

  getAllDebugInfo() {
    return this._integrations.map(driver => driver.debugInfo)
  }
}
