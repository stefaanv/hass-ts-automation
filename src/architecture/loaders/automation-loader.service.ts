import { isLeft, isRight, left, right, tryit } from '@bruyland/utilities'
import { Injectable, Logger, LoggerService, NotImplementedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { readdirSync } from 'fs'
import { resolve } from 'path'
import { LoadableConstructorSchema, LoadableSchema } from '../loadable-base-classes/loadable'
import { AutomationBase } from '../loadable-base-classes/automation.base'
import { red, white } from 'ansi-colors'
import { load } from './loader-base'

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
    const folder = this._config.get('automationsfolder', '')
    const extension = this._config.get('automationExtension', '.automation.js')
    const configExtension = this._config.get('configExtension', '.config.js')

    //TODO mogelijk om deze dynamisch te laten loaden in Nestjs !
    //https://stackoverflow.com/questions/69144734/how-to-dynamically-inject-providers-in-nestjs
    setTimeout(
      () => load(folder, extension, configExtension, 'automation', _config, _eventEmitter, this._log),
      1000,
    )
  }
}
