import { Loadable } from './loadable'

export abstract class AutomationBase extends Loadable {
  _generalConfigKey = 'automationsConfig'
  _configConfigKey = 'automations'
}
