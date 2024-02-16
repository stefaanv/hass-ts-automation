import { Loadable } from './loadable'
import { Entity } from '../entities/entity.model'

export abstract class IntegrationBase extends Loadable {
  public entities: Entity[] = []

  protected get globalConfigKeyChain(): string[] {
    return ['integrationsConfig', this.id]
  }
}
