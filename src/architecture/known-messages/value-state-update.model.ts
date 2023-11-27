import { StateUpdate } from './state-update.model'

export class ValueStateUpdate extends StateUpdate {
  type = 'ValueStateUpdate'

  constructor(
    public state: string,
    public unit: string,
    public numberState?: number,
  ) {
    super()
  }

  override toString() {
    return `${this.numberState ?? this.state} ${this.unit}`
  }
}
