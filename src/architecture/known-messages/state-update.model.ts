import { KnownContent } from '../message.model'

export class StateUpdate extends KnownContent {
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
