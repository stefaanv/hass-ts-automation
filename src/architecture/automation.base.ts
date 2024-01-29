import { EventEmitter2 } from '@nestjs/event-emitter'
import { ConfigService } from '@nestjs/config'
import { Loadable } from './loadable'
import { Logger } from '@nestjs/common'

const GOBAL_AUTOMATIONS_CONFIG_PREFIX = 'automations'

export abstract class AutomationBase extends Loadable {
  protected _log: Logger = new Logger(AutomationBase.name)
  static eventEmitter: EventEmitter2
  protected get globalConfigKeyChain(): string[] {
    return [GOBAL_AUTOMATIONS_CONFIG_PREFIX, this.id]
  }

  constructor(
    protected _eventEmitter: EventEmitter2,
    localConfig: any, // content of the config file with the same name as the driver file
    globalConfig: ConfigService,
  ) {
    super(localConfig, globalConfig)
  }
}
