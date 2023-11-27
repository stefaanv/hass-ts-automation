import { KnownContent } from '../message.model'

export type BinaryState = 'on' | 'off' | 'open' | 'closed' | 'unknown'

export class BinaryStateUpdate extends KnownContent {
  constructor(public state: BinaryState) {
    super()
  }

  override toString() {
    return `${this.state}`
  }
}
