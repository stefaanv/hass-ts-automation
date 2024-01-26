import { StateUpdate } from './state-update.model'

export abstract class SingleValueUpdate extends StateUpdate {
  constructor(
    public state: number,
    public unit = '',
    public precision = 0,
    timestamp = new Date(),
  ) {
    super(timestamp)
  }

  override toString() {
    return this.state.toFixed(this.precision) + ' ' + this.unit
  }
}

export class LightDimStateUpdate extends SingleValueUpdate { }
