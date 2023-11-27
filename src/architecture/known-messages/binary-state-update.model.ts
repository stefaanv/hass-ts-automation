import { StateUpdate } from './state-update.model'

export type BinaryState = 'on' | 'off' | 'open' | 'closed' | 'unknown'

export class BinaryStateUpdate extends StateUpdate {
  type = 'BinaryStateUpdate'

  constructor(public state: BinaryState) {
    super()
  }

  override toString() {
    return `${this.state}`
  }
}
