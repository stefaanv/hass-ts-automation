import { EventEmitter2 } from '@nestjs/event-emitter'
import { ConfigService } from '@nestjs/config'
import { IMessageContent, Message } from './message.model'
import { Loadable } from './loadable'
import { first, isString, keys } from 'radash'

const GOBAL_CONFIG_PREFIX = 'drivers'
export interface IncomingEntities {
  entity: string
  outEntity: string
  type: string
}
export type EntityDefinition = string | Record<string, string>
export interface IncomingEntityDefinitions {
  motionDetectors: EntityDefinition[]
  doorContacts: EntityDefinition[]
  lights: EntityDefinition[]
  lightLevel: EntityDefinition[]
}

export abstract class DriverBase extends Loadable {
  // protected readonly _blockFilters: MultiRegex
  // protected readonly _selectFilters: MultiRegex
  // protected readonly _entityTranslation: Record<string, string>
  // protected readonly _bulkRename: RegexTemplateReplace
  static eventEmitter: EventEmitter2
  protected readonly entityTypes: IncomingEntities[]

  get origin() {
    return `driver.${this.id}`
  }

  constructor(filenameRoot: string, localConfig: any, globalConfig: ConfigService) {
    super(filenameRoot, localConfig, globalConfig)
    this._globalConfigKeys = [GOBAL_CONFIG_PREFIX, this.id]
    const incoming = this.getConfig<any>('incomingEntities')
    this.entityTypes = Object.keys(incoming).flatMap((type: string) =>
      (incoming[type] as (string | Record<string, string>)[]).map(entry => {
        const entity = isString(entry) ? entry : first(keys(entry))!
        return isString(entry)
          ? { entity, outEntity: entry, type }
          : { entity, outEntity: entry[entity], type }
      }),
    )
  }

  // filter(entity: string): boolean {
  //   if (this._blockFilters.test(entity)) return false
  //   return this._selectFilters.test(entity)
  // }

  // translateEntityName(entity: string | undefined): string | undefined {
  //   if (entity === undefined) return undefined
  //   const bulk = this._bulkRename.transform(entity)
  //   return this._entityTranslation[bulk] ?? bulk
  // }

  sendMessage(entity: string, content: IMessageContent) {
    // translate the entity name
    // const trEntity = this.translateEntityName(entity)
    // if (!trEntity || this._blockFilters.test(trEntity) || !this._selectFilters.test(trEntity)) return
    // const message = new Message(this.origin, trEntity, content)
    const message = new Message(this.origin, entity, content)

    // debug log and distribute
    console.log(message.toString()) //TODO vervangen door debugLog
    DriverBase.eventEmitter.emit(`driver.${this.id}`, message)
  }
}
