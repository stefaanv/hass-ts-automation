export type KnownMessage = SensorStateUpdate | undefined

export interface SensorState {
  state: string
  numberState?: number
  time: Date
}

export interface SensorStateUpdate extends SensorState {
  nativeEntity: string
  entity: string
  originatingDriver: string
  unit: string
  history?: SensorState[]
}
