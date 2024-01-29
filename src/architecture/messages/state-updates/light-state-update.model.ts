import { StateUpdate } from '../message.model'

interface LightState {
  on: boolean
  brightness: number
  reachable: boolean
}

export class StateUpdate extends StateUpdate {
  constructor(
    origin: string,
    entityName: string,
    public state: LightState,
    timestamp = new Date(),
  ) {
    super(origin, entityName, timestamp)
  }

  override toString() {
    return `Light "${this.entityName}" changed to `
  }
}
