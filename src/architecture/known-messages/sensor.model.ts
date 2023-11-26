import { KnownContent } from '../message.model'

export class SensorState extends KnownContent {
  constructor(
    public state: string,
    public unit: string,
    public numberState?: number,
    public time: Date = new Date(),
  ) {
    super()
  }

  override toString() {
    return `${this.numberState ?? this.state} ${this.unit}`
  }
}

export interface SensorStateUpdate extends SensorState {
  nativeEntity: string
  entity: string
  originatingDriver: string
  history?: SensorState[]
}
