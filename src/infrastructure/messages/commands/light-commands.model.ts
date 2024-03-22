import { CommandMessage } from '../message.model'

export class ToggleLightCommand extends CommandMessage<undefined> {
  toString() {
    return `Togglr light "${this.entityId}"`
  }
}

export const lightTargetStateValues = ['on', 'off'] as const
export type LightTargetState = (typeof lightTargetStateValues)[number]

export class TurnLightCommand extends CommandMessage<LightTargetState> {
  toString() {
    return `Turn light "${this.entityId}" ${this.target}`
  }
}
