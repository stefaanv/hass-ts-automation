import { EventEmitter2 } from '@nestjs/event-emitter'
import { ConfigService } from '@nestjs/config'
import { Loadable } from './loadable'
import { Entity } from './entities/entity.model'
import { Logger } from '@nestjs/common'
import { Message } from './messages/message.model'

const GOBAL_INTEGRATIONS_CONFIG_PREFIX = 'integrations'

export abstract class IntegrationBase extends Loadable {
  protected _log: Logger = new Logger(IntegrationBase.name)
  public entities: Entity[] = []
  protected get globalConfigKeyChain(): string[] {
    return [GOBAL_INTEGRATIONS_CONFIG_PREFIX, this.id]
  }
  abstract get debugInfo(): object

  constructor(
    protected _eventEmitter: EventEmitter2,
    localConfig: any, // content of the config file with the same name as the driver file
    globalConfig: ConfigService,
  ) {
    super(localConfig, globalConfig)
  }

  sendMessage(message: Message) {
    this._eventEmitter.emit(message.entity, message)
  }
}
