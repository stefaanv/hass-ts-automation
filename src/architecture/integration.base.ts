import { EventEmitter2 } from '@nestjs/event-emitter'
import { ConfigService } from '@nestjs/config'
import { Loadable } from './loadable'
import { Entity } from './entities/entity.model'
import { Logger } from '@nestjs/common'
import { white } from 'ansi-colors'
import { StateUpdate } from './event-models/message.model'

const GOBAL_DRIVERS_CONFIG_PREFIX = 'integrations'

export abstract class IntegrationBase extends Loadable {
  protected _log: Logger
  static eventEmitter: EventEmitter2
  public entities: Entity[] = []
  protected get globalConfigKeyChain(): string[] {
    return [GOBAL_DRIVERS_CONFIG_PREFIX, this.id]
  }
  abstract get debugInfo(): object

  // get origin() {
  //   return `driver.${this.id}`
  // }

  // constructor(filenameRoot: string, localConfig: any, globalConfig: ConfigService) {
  constructor(
    localConfig: any, // content of the config file with the same name as the driver file
    globalConfig: ConfigService,
  ) {
    super(localConfig, globalConfig)
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

  sendMessage(message: StateUpdate) {
    IntegrationBase.eventEmitter.emit(message.entityName, message)
  }
}
