import { StateUpdate } from '../message.model'

export abstract class EnumStateUpdate<T extends string> extends StateUpdate {
  constructor(
    origin: string,
    entity: string,
    public state: T,
    timestamp = new Date(),
  ) {
    super(origin, entity, timestamp)
  }

  override toString() {
    return this.state
  }
}

export const presenceStateValues = ['present', 'absent'] as const
export type PresenceState = (typeof presenceStateValues)[number]
export class PresenceStateUpdate extends EnumStateUpdate<PresenceState> {}

export const lightOnoffStateValues = ['on', 'off']
export type LightOnoffState = (typeof lightOnoffStateValues)[number]
export class LightOnoffStateUpdate extends EnumStateUpdate<LightOnoffState> {}

export const openCloseStateValues = ['open', 'closed'] as const
export type OpenCloseState = (typeof lightOnoffStateValues)[number]
export class OpenCloseStateUpdate extends EnumStateUpdate<OpenCloseState> {}
