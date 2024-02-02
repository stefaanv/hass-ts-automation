import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { IntegrationBase } from '../loadable-base-classes/integration.base'
import { EventEmitter2 } from 'eventemitter2'
import { ConfigService } from '@nestjs/config'
import { load } from './loader-base'
import { objectify } from 'radash'

@Injectable()
export class IntegrationLoader {
  private _integrations: IntegrationBase[] = []
  private readonly _log: LoggerService
  private readonly _folder: string
  private readonly _localConfigFolder: string
  private readonly _extension: string
  private readonly _configExtension: string

  constructor(
    private readonly _config: ConfigService,
    private readonly _eventEmitter: EventEmitter2,
  ) {
    this._log = new Logger(IntegrationLoader.name)
    this._folder = this._config.get('integrations.programFolder', '')
    this._extension = this._config.get('integrations.extension', '.integration.js')
    this._localConfigFolder = this._config.get('integrations.configFolder', '')
    this._configExtension = this._config.get('configExtension', '.config.js')
  }

  getAllDebugInfo() {
    return objectify(
      this._integrations,
      value => value.id,
      value => ({
        debug: value.debug,
        debugInfo: value.debugInfo,
      }),
    )
  }

  //TODO mogelijk om deze dynamisch te laten loaden in Nestjs !
  //https://stackoverflow.com/questions/69144734/how-to-dynamically-inject-providers-in-nestjs
  async loadAll() {
    const loaded = await load(
      this._folder,
      this._extension,
      this._configExtension,
      'integration',
      this._config,
      this._eventEmitter,
      this._log,
    )
    this._integrations = loaded as IntegrationBase[]
  }
}
