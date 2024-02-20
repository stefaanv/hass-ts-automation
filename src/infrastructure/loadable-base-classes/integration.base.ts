import { Loadable } from './loadable'

export abstract class IntegrationBase extends Loadable {
  _generalConfigKey = 'integrations'
  _configConfigKey = 'integrationsConfig'
}
