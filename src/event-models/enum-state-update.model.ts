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
export class PresenceStateUpdate extends EnumStateUpdate<PresenceState> {}

export type LightOnoffState = 'on' | 'off'
export class LightOnoffStateUpdate extends EnumStateUpdate<LightOnoffState> {}

export type OpenCloseState = 'open' | 'closed'
export class OpenCloseStateUpdate extends EnumStateUpdate<OpenCloseState> {}
