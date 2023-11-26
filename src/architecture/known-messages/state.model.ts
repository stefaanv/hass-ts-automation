import { KnownContent } from '../message.model'

export class State extends KnownContent {
  constructor(
    public state: string,
    public unit: string,
    public numberState?: number,
    public time: Date = new Date(),
  ) {
    super()
  }

  override toString() {
    return `${this.numberState ?? this.state} ${this.unit}`
  }
}
