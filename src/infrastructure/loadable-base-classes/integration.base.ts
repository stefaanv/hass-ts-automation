import { Loadable } from './loadable'
import { Entity } from '../entities/entity.model'
import { Logger } from '@nestjs/common'
import { Message } from '../messages/message.model'

const GOBAL_INTEGRATIONS_CONFIG_PREFIX = 'integrationsConfig'

export abstract class IntegrationBase extends Loadable {
  protected _log: Logger = new Logger(IntegrationBase.name)
  public entities: Entity[] = []
  protected get globalConfigKeyChain(): string[] {
    return [GOBAL_INTEGRATIONS_CONFIG_PREFIX, this.id]
  }
  abstract get debugInfo(): object
  async test(...params: any[]): Promise<any> {
    const msg = `no test defined in ${this.id} integration`
    this._log.error(msg)
    return msg
  }
}
