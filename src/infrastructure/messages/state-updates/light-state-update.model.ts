import { white } from 'ansi-colors'
import { StateUpdate } from '../message.model'

export const LIGHT_STATES = ['on', 'off', 'unreachable', undefined] as const
export type LightStateEnum = (typeof LIGHT_STATES)[number]

export class LightState {
  constructor(
    public state: LightStateEnum = undefined,
    public brightness: number | undefined = undefined,
  ) {}

  static clone(other: LightState) {
    return new LightState(other.state, other.brightness)
  }

  isEqual(other: LightState) {
    if (!other) return false
    return this.state == other.state && this.brightness === other.brightness
  }

  get isKnownAndReachable() {
    return this.state === 'off' || this.state === 'on'
  }

  toString() {
    const result = this.state + (this.state === 'on' ? ` (bri ${this.brightness})` : '')
    return result
  }
}

export class LightStateUpdate extends StateUpdate<LightState> {
  toString() {
    return `Light "${this.entityId}" changed to ${white(this.state.toString())}`
  }
}
