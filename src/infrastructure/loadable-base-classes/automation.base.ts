import { Loadable } from './loadable'
import { Logger } from '@nestjs/common'

const GOBAL_AUTOMATIONS_CONFIG_PREFIX = 'automationsConfig'

export abstract class AutomationBase extends Loadable {
  protected _log: Logger = new Logger(AutomationBase.name)
  protected get globalConfigKeyChain(): string[] {
    return [GOBAL_AUTOMATIONS_CONFIG_PREFIX, this.id]
  }
}
