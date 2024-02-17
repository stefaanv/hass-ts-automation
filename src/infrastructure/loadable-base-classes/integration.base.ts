import { Loadable } from './loadable'
import { Entity } from '../entities/entity.model'

export abstract class IntegrationBase extends Loadable {
  public entities: Entity[] = []

  _generalConfigKey = 'integrations'
  _configConfigKey = 'integrationsConfig'
}
