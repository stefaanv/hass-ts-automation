import { StateUpdate } from './state-update.model'

export type LightOnoffState = 'on' | 'off'

export class LightOnoffStateUpdate extends StateUpdate {
  constructor(
    public state: LightOnoffState,
    timestamp: Date,
  ) {
    super()
    this.timestamp = timestamp
  }

  override toString() {
    return this.state
  }
}
