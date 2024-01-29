import { tryit } from '@bruyland/utilities'
import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { AutomationBase } from '../loadable-base-classes/automation.base'
import { load } from './loader-base'

@Injectable()
export class AutomationLoader {
  private readonly _log: LoggerService
  private _automations: AutomationBase[] = []
  private readonly _folder: string
  private readonly _extension: string
  private readonly _configExtension: string

  constructor(
    private readonly _config: ConfigService,
    private readonly _eventEmitter: EventEmitter2,
  ) {
    this._log = new Logger(AutomationLoader.name)
    this._folder = this._config.get('automationsfolder', '')
    this._extension = this._config.get('automationExtension', '.automation.js')
    this._configExtension = this._config.get('configExtension', '.config.js')
  }

  getAllDebugInfo() {
    return {}
  }

  //TODO mogelijk om deze dynamisch te laten loaden in Nestjs !
  //https://stackoverflow.com/questions/69144734/how-to-dynamically-inject-providers-in-nestjs
  async loadAll() {
    const loaded = await load(
      this._folder,
      this._extension,
      this._configExtension,
      'automation',
      this._config,
      this._eventEmitter,
      this._log,
    )
    this._automations = loaded as AutomationBase[]
  }
}
