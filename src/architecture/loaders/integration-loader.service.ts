import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { IntegrationBase } from '../loadable-base-classes/integration.base'
import { tryit } from '@bruyland/utilities'
import { EventEmitter2 } from 'eventemitter2'
import { ConfigService } from '@nestjs/config'
import { load } from './loader-base'

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
    const folder = this._config.get('integrationsfolder', '')
    const extension = this._config.get('integrationExtension', '.integration.js')
    const configExtension = this._config.get('configExtension', '.config.js')

    //TODO mogelijk om deze dynamisch te laten loaden in Nestjs !
    //https://stackoverflow.com/questions/69144734/how-to-dynamically-inject-providers-in-nestjs
    setTimeout(
      () => load(folder, extension, configExtension, 'automation', _config, _eventEmitter, this._log),
      1000,
    )

    // setTimeout(() => this.loadIntegrations(), 1000)
  }

  getAllDebugInfo() {
    return this._integrations.map(integration => integration.debugInfo)
  }
}
