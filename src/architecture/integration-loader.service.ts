import { Injectable, Logger, LoggerService, NotImplementedException } from '@nestjs/common'
import { IntegrationBase } from './integration.base'
import { isLeft, isRight, left, right, tryit } from '@bruyland/utilities'
import { EventEmitter2 } from 'eventemitter2'
import { ConfigService } from '@nestjs/config'
import { red, white, yellow } from 'ansi-colors'
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
    setTimeout(() => this.loadIntegrations(), 1000)
  }

  //TODO het grootste deel hiervan kan naar de Loadable klasse verhuizen !
  async loadIntegrations() {
    const integrationsFolder = this._config.get('integrationsfolder', '')
    const integrationExtension = this._config.get('integrationExtension', '.integration.js')
    const configExtension = this._config.get('configExtension', '.config.js')
    const allFiles = readdirSync(integrationsFolder, {
      recursive: true,
      withFileTypes: false,
      encoding: 'utf-8',
    })
    const integrationFiles = allFiles.filter(f => f.endsWith(integrationExtension))
    const configFiles = allFiles.filter(f => f.endsWith(configExtension))

    this._log.log(`Start loading ${integrationFiles.length} integrations`)
    const stripRegex = new RegExp(`\\${integrationExtension}$`)
    // for every integration
    for (const filename of integrationFiles) {
      // deduce the name of the config file (e.g. myDriver.integration.js -> myDriver.config.js)
      const configFilename = filename.replace(stripRegex, configExtension)
      let localConfig = {} // localConfig default in case of no config file or erors
      // try import the local config file
      if (configFiles.includes(configFilename)) {
        const configFullPath = resolve(integrationsFolder, configFilename)
        const either = await tryImport(configFullPath)
        if (isLeft(either)) {
          this._log.warn(`Unable to load local config file ${configFilename} - ${left(either).message}}`)
        } else {
          localConfig = right(either).default
        }
      }

      const integrationFullPath = resolve(integrationsFolder, filename)
      const either = await tryImport(integrationFullPath)
      if (isRight(either)) {
        // load the integration
        const integrationClass = right(either).default
        // Check if the integration class has the correct form
        const [error1] = tryit(LoadableConstructorSchema.parse)(integrationClass)
        if (error1) {
          this._log.error(`Driver ${filename} constructor is incorrect - ${error1.message}}`)
          return
        }

        // try instantiating the integration
        const integrationInstance: IntegrationBase = new integrationClass(
          filename,
          this._eventEmitter,
          localConfig,
          this._config,
        )
        const [error2] = tryit(LoadableSchema.parse)(integrationInstance)
        if (error2) {
          this._log.error(`Integration ${filename} class has incorrect form - ${error2.message}}`)
          this._log.debug!(error2)
          return
        }

        this._log.log(`Driver ${white(integrationInstance.name)} v${integrationInstance.version} loaded`)

        // try to start the integration
        const started = await integrationInstance.start() // TODO handle possible errors
        if (started) {
          this._integrations.push(integrationInstance)
          this._log.log(`${white(integrationInstance.name)} ` + 'started')
        } else {
          this._log.error(red(`Unable to start ${integrationInstance.name} integration`))
        }
      } else {
        //TODO
        throw new NotImplementedException('integration-loader-service loadIntegrations 2nd part else')
      }
    }
  }

  getAllDebugInfo() {
    return this._integrations.map(integration => integration.debugInfo)
  }
}
