import { Loadable } from './loadable'

export abstract class IntegrationBase extends Loadable {
  _generalConfigKey = 'integrations'
  _configConfigKey = 'integrationsConfig'

  abstract start(): Promise<boolean>
  abstract stop(): Promise<void>
}
