import { EventEmitter2 } from '@nestjs/event-emitter'
import { ConfigService } from '@nestjs/config'
import { Loadable } from './loadable'
import { Entity } from './entities/entity.model'
import { Logger, NotImplementedException } from '@nestjs/common'
import { white } from 'ansi-colors'

const GOBAL_DRIVERS_CONFIG_PREFIX = 'integrations'

export abstract class DriverBase extends Loadable {
  protected _log: Logger
  static eventEmitter: EventEmitter2
  public entities: Entity[] = []
  protected get globalConfigKeyChain(): string[] {
    return [GOBAL_DRIVERS_CONFIG_PREFIX, this.id]
  }
  // get origin() {
  //   return `driver.${this.id}`
  // }

  // constructor(filenameRoot: string, localConfig: any, globalConfig: ConfigService) {
  constructor(
    localConfig: any, // content of the config file with the same name as the driver file
    globalConfig: ConfigService,
  ) {
    super(localConfig, globalConfig)

    //TODO Codes hieronder refactoren indien nodig en nuttig
    /*
    const entityConfig = this.getConfig<IncomingEntityDefinitions>('incomingEntities')
    if (entityConfig) {
      this.entityTypes = Object.keys(entityConfig).flatMap((type: keyof IncomingEntityDefinitions) =>
        (entityConfig[type] as (string | Record<string, string>)[]).map(entry => {
          const entity = isString(entry) ? entry : first(Object.keys(entry))!
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
          const entity = isString(entry) ? entry : first(Object.keys(entry))!
          return isString(entry)
            ? { entity, outEntity: entry, type }
            : { entity, outEntity: entry[entity], type }
        }),
      )
    }
    */
  }

  protected reportStarted(error: Error | undefined = undefined) {
    if (!error) {
      this._log.log(`${this.name} driver ` + white('started'))
      return true
    } else {
      this._log.error(`Unable to start ${this.name} driver: ${error.message}`)
      console.log(error)
      return false
    }
  }

  protected reportStopped() {
    this._log.log(`${this.name} driver ` + white('stopped'))
  }

  sendMessage(entity: string /*content: IMessageContent*/) {
    throw new NotImplementedException(`DriverBase.sendMessage()`)
    /*
    const message = new Message(this.origin, entity, content)

    // debug log and distribute
    console.log(message.toString()) //TODO vervangen door debugLog
    DriverBase.eventEmitter.emit(`driver.${this.id}`, message)
    */
  }
}
