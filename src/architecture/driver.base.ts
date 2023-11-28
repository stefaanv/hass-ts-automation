import { EventEmitter2 } from '@nestjs/event-emitter'
import { ConfigService } from '@nestjs/config'
import { IMessageContent, Message } from './message.model'
import { Loadable } from './loadable'
import { first, isString, keys } from 'radash'

const GOBAL_CONFIG_PREFIX = 'drivers'
export interface EntityDefinition {
  entity: string
  outEntity: string
  type: string
}
export type EntityDefinitionConfig = string | Record<string, string>
export interface IncomingEntityDefinitions {
  motionDetectors: EntityDefinitionConfig[]
  doorContacts: EntityDefinitionConfig[]
  lights: EntityDefinitionConfig[]
  lightLevel: EntityDefinitionConfig[]
}

export interface CommandDefinitions {
  light: EntityDefinitionConfig[]
}

export abstract class DriverBase extends Loadable {
  static eventEmitter: EventEmitter2
  protected readonly entityTypes: EntityDefinition[] = []
  protected readonly commands: EntityDefinition[] = []

  get origin() {
    return `driver.${this.id}`
  }

  constructor(filenameRoot: string, localConfig: any, globalConfig: ConfigService) {
    super(filenameRoot, localConfig, globalConfig)
    this._globalConfigKeys = [GOBAL_CONFIG_PREFIX, this.id]
    //TODO omzetting extraheren naar functie
    const entityConfig = this.getConfig<IncomingEntityDefinitions>('incomingEntities')
    if (entityConfig) {
      this.entityTypes = Object.keys(entityConfig).flatMap((type: keyof IncomingEntityDefinitions) =>
        (entityConfig[type] as (string | Record<string, string>)[]).map(entry => {
          const entity = isString(entry) ? entry : first(keys(entry))!
          return isString(entry)
            ? { entity, outEntity: entry, type }
            : { entity, outEntity: entry[entity], type }
        }),
      )
    }
    const commandConfig = this.getConfig<CommandDefinitions>('commands')
    if (commandConfig) {
      this.commands = Object.keys(commandConfig).flatMap((type: keyof CommandDefinitions) =>
        (commandConfig[type] as (string | Record<string, string>)[]).map(entry => {
          const entity = isString(entry) ? entry : first(keys(entry))!
          return isString(entry)
            ? { entity, outEntity: entry, type }
            : { entity, outEntity: entry[entity], type }
        }),
      )
    }
  }

  sendMessage(entity: string, content: IMessageContent) {
    const message = new Message(this.origin, entity, content)

    // debug log and distribute
    console.log(message.toString()) //TODO vervangen door debugLog
    DriverBase.eventEmitter.emit(`driver.${this.id}`, message)
  }
}
