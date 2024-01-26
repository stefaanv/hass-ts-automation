import { StateUpdate } from './state-update.model'

export class ValueStateUpdate extends StateUpdate {
  constructor(
    public state: string,
    public unit: string,
    public numberState?: number,
    timestamp = new Date(),
  ) {
    super()
    this.timestamp = timestamp
  }

  override toString() {
    return `${this.numberState ?? this.state} ${this.unit}`
  }
}
