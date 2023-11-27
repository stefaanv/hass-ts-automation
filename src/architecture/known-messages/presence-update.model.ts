import { StateUpdate } from './state-update.model'

export type PresenceState = 'present' | 'absent'

export class PresenceStateUpdate extends StateUpdate {
  type = 'PresenceStateUpdate'

  constructor(
    public state: PresenceState,
    timestamp: Date,
  ) {
    super()
    this.timestamp = timestamp
  }

  override toString() {
    return this.state
  }
}
