import { isLeft, isRight, left, right, tryit } from '@bruyland/utilities'
import { Injectable, Logger, LoggerService, NotImplementedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { readdirSync } from 'fs'
import { resolve } from 'path'
import { LoadableConstructorSchema, LoadableSchema } from './loadable'
import { AutomationBase } from './automation.base'
import { red, white } from 'ansi-colors'

const tryImport = tryit(async (file: string) => import(file))

@Injectable()
export class AutomationLoader {
  private readonly _log: LoggerService
  private readonly _automations: AutomationBase[] = []

  constructor(
    private readonly _config: ConfigService,
    private readonly _eventEmitter: EventEmitter2,
  ) {
    this._log = new Logger(AutomationLoader.name)
    setTimeout(() => this.loadAutomations(), 1000)
  }

  //TODO het grootste deel hiervan kan naar de Loadable klasse verhuizen !
  //TODO mogelijk om deze dynamisch te laten loaden in Nestjs !
  async loadAutomations() {
    const automationsFolder = this._config.get('automationsfolder', '')
    const automationExtension = this._config.get('automationExtension', '.automation.js')
    const configExtension = this._config.get('configExtension', '.config.js')
    const allFiles = readdirSync(automationsFolder, {
      recursive: true,
      withFileTypes: false,
      encoding: 'utf-8',
    })
    const automationFiles = allFiles.filter(f => f.endsWith(automationExtension))
    const configFiles = allFiles.filter(f => f.endsWith(configExtension))

    this._log.log(`Start loading ${automationFiles.length} automations`)
    const stripRegex = new RegExp(`\\${automationExtension}$`)

    // for every automation
    for (const filename of automationFiles) {
      // deduce the name of the config file (e.g. myDriver.automation.js -> myDriver.config.js)
      const configFilename = filename.replace(stripRegex, configExtension)
      let localConfig = {} // localConfig default in case of no config file or erors
      // try import the local config file
      if (configFiles.includes(configFilename)) {
        const configFullPath = resolve(automationsFolder, configFilename)
        const either = await tryImport(configFullPath)
        if (isLeft(either)) {
          this._log.warn(`Unable to load local config file ${configFilename} - ${left(either).message}}`)
        } else {
          localConfig = right(either).default
        }
      }

      const automationFullPath = resolve(automationsFolder, filename)
      const either = await tryImport(automationFullPath)
      if (isRight(either)) {
        // load the automation
        const automationClass = right(either).default
        // Check if the automation class has the correct form
        const [error1] = tryit(LoadableConstructorSchema.parse)(automationClass)
        if (error1) {
          this._log.error(`Driver ${filename} constructor is incorrect - ${error1.message}}`)
          return
        }

        // try instantiating the automation
        const automationInstance: AutomationBase = new automationClass(
          filename,
          this._eventEmitter,
          localConfig,
          this._config,
        )
        const [error2] = tryit(LoadableSchema.parse)(automationInstance)
        if (error2) {
          this._log.error(`Automation ${filename} class has incorrect form - ${error2.message}}`)
          this._log.debug!(error2)
          return
        }

        this._log.log(`Driver ${white(automationInstance.name)} v${automationInstance.version} loaded`)

        // try to start the automation
        const started = await automationInstance.start() // TODO handle possible errors
        if (started) {
          this._automations.push(automationInstance)
          this._log.log(`${white(automationInstance.name)} ` + 'started')
        } else {
          this._log.error(red(`Unable to start ${automationInstance.name} automation`))
        }
      } else {
        //TODO
        throw new NotImplementedException('automation-loader-service loadIntegrations 2nd part else')
      }
    }
  }
}
