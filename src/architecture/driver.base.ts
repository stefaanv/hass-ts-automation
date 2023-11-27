import { EventEmitter2 } from '@nestjs/event-emitter'
import { ConfigService } from '@nestjs/config'
import { construct, crush, get } from 'radash'
import { MultiRegex, RegexTemplateReplace } from '@src/utilities'
import { Message } from './message.model'
import { Loadable } from './loadable'

const GOBAL_CONFIG_PREFIX = 'drivers'

export abstract class DriverBase extends Loadable {
  protected readonly _blockFilters: MultiRegex
  protected readonly _selectFilters: MultiRegex
  protected readonly _entityTranslation: Record<string, string>
  protected readonly _bulkRename: RegexTemplateReplace
  static eventEmitter: EventEmitter2

  constructor(filenameRoot: string, localConfig: any, globalConfig: ConfigService) {
    super(filenameRoot, localConfig, globalConfig)
    const globalKey = [GOBAL_CONFIG_PREFIX, this.id].join('.')
    this._globalConfigKeys = [GOBAL_CONFIG_PREFIX, this.id]
    this._blockFilters = new MultiRegex(this.getConfig('blockFilters', []))
    this._selectFilters = new MultiRegex(this.getConfig('selectFilters', []), true)
    this._entityTranslation = this.getConfig('entityTranslation', {})
    this._bulkRename = new RegexTemplateReplace(this.getConfig('bulkRename'))
  }

  filter(entity: string): boolean {
    if (this._blockFilters.test(entity)) return false
    return this._selectFilters.test(entity)
  }

  translateEntityName(entity: string | undefined): string | undefined {
    if (entity === undefined) return undefined
    const bulk = this._bulkRename.transform(entity)
    return this._entityTranslation[bulk] ?? bulk
  }

  handleIncomingMessage(message: Message) {
    // translate the entity name
    const trEntity = this.translateEntityName(message.entity)
    if (!trEntity || this._blockFilters.test(trEntity) || !this._selectFilters.test(trEntity)) return
    message.entity = trEntity

    // debug log and distribute
    console.log(message.toString()) //TODO vervangen door debugLog
    DriverBase.eventEmitter.emit(`driver.${this.id}`, message)
  }
}
