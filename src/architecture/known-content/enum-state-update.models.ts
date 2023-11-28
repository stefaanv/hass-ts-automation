import { KnownContent } from '../message.model'
import { StateUpdate } from './state-update.model'

export abstract class EnumStateUpdate<T extends string> extends StateUpdate {
  constructor(
    public state: T,
    timestamp = new Date(),
  ) {
    super(timestamp)
  }

  override toString() {
    return this.state
  }
}

export type PresenceState = 'present' | 'absent'

export class PresenceStateUpdate extends EnumStateUpdate<PresenceState> {
  constructor(
    public state: PresenceState,
    timestamp: Date,
  ) {
    super(state, timestamp)
  }
}
