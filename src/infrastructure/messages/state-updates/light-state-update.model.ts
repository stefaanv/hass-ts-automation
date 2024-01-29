import { white } from 'ansi-colors'
import { StateUpdate } from '../message.model'

export class LightState {
  on: boolean
  brightness?: number
  reachable: boolean

  constructor(content?: Partial<LightState>) {
    this.reachable = content?.reachable ?? false
    this.on = content?.on ?? false
    this.brightness = content?.brightness ?? 0
  }

  isEqual(other: LightState) {
    if (!other) return false
    return this.reachable == other.reachable && this.on == other.on && this.reachable == other.reachable
  }

  toString() {
    const result =
      (!this.reachable ? 'unreachable' : this.on ? 'ON' : 'OFF') +
      (this.reachable && this.on ? ` (bri ${this.brightness})` : '')
    return result
  }
}

export class LightStateUpdate extends StateUpdate<LightState> {
  toString() {
    return `Light "${this.entity}" changed to ${white(this.state.toString())}`
  }
}
