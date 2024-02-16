import { Loadable } from './loadable'

export abstract class AutomationBase extends Loadable {
  protected get globalConfigKeyChain(): string[] {
    return ['automationsConfig', this.id]
  }
}
