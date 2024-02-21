import { isLeft, isRight, left, right, tryit } from '@bruyland/utilities'
import { LoggerService, NotImplementedException } from '@nestjs/common'
import { readdirSync } from 'fs'
import { resolve } from 'path'
import {
  ILoadable,
  IntegrationSchema,
  Loadable,
  LoadableConstructorSchema,
  LoadableSchema,
} from '../loadable-base-classes/loadable'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ConfigService } from '@nestjs/config'
import { green, red, white, yellow } from 'ansi-colors'
import { IntegrationBase } from '../loadable-base-classes/integration.base'

const tryImport = tryit(async (file: string) => import(file))

export class Loader {}

export async function load(
  folder: string,
  extension: string,
  configFolder: string,
  configExtension: string,
  type: 'automation' | 'integration',
  ignore: string[],
  config: ConfigService,
  eventEmitter: EventEmitter2,
  log: LoggerService,
) {
  const result: ILoadable[] = []
  let allProgramFiles: string[] = []
  let allLocalConfigFiles: string[] = []
  try {
    allProgramFiles = readdirSync(folder, {
      recursive: true,
      withFileTypes: false,
      encoding: 'utf-8',
    })
    allLocalConfigFiles = readdirSync(configFolder, {
      recursive: true,
      withFileTypes: false,
      encoding: 'utf-8',
    })
  } catch (error) {
    log.error(error)
    console.log('programsFolder=', folder)
    console.log('configFolder=', configFolder)
  }
  const files = allProgramFiles.filter(f => f.endsWith(extension)).filter(f => !ignore.includes(f))
  const configFiles = allLocalConfigFiles.filter(f => f.endsWith(configExtension))

  log.log(`Start loading ${files.length} ${type}s`)
  const stripRegex = new RegExp(`\\${extension}$`)

  for (const filename of files) {
    // deduce the name of the config file (e.g. myDriver.automation.js -> myDriver.config.js)
    const configFilename = filename.replace(stripRegex, configExtension)
    let localConfig = {} // localConfig default in case of no config file or erors
    // try import the local config file
    if (configFiles.includes(configFilename)) {
      const configFullPath = resolve(configFolder, configFilename)
      const either = await tryImport(configFullPath)
      if (isLeft(either)) {
        log.warn(`Unable to load local config file ${configFilename} - ${left(either).message}}`)
      } else {
        localConfig = right(either).default
      }
    }

    const fullPath = resolve(folder, filename)
    const either = await tryImport(fullPath)
    if (isRight(either)) {
      // load the automation
      const _class = right(either).default
      // Check if the automation class has the correct form
      const [error1] = tryit(LoadableConstructorSchema.parse)(_class)
      if (error1) {
        log.error(`Driver ${filename} constructor is incorrect - ${error1.message}}`)
        continue
      }

      // try instantiating the automation
      const instance: Loadable = new _class(filename, eventEmitter, localConfig, config)
      const Schema = type === 'integration' ? IntegrationSchema : LoadableSchema
      const [error2] = tryit(Schema.parse)(instance)
      if (error2) {
        log.error(`Automation ${filename} class has incorrect form - ${error2.message}}`)
        console.error(error2)
        continue
      }

      log.log(
        `${white(instance.name) + ' ' + yellow(type + ' loaded ')}` +
          green(` (v${instance.version})`),
      )

      if (type === 'integration') {
        // try to start the integration
        const integration = instance as IntegrationBase
        const started = await integration.start() // TODO handle possible errors
        if (started) {
          result.push(instance)
          log.log(`${instance.name} integration ${yellow('started')}`)
        } else {
          log.error(red(`Unable to start ${instance.name} automation`))
        }
      }
    } else {
      //TODO
      throw new NotImplementedException('automation-loader-service loadIntegrations 2nd part else')
    }
  }
  return result
}
