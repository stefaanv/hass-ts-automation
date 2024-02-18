import { Loadable } from './loadable'

export abstract class AutomationBase extends Loadable {
  _generalConfigKey = 'automations'
  _configConfigKey = 'automationsConfig'
}
