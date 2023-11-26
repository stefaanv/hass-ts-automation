export interface SensorStateUpdateEvent {
  nativeEntity: string
  entity: string
  originatingDriver: string
  unit: string
  state: string
  numberState?: number
  lastStateChange: Date
  history: SensorState[]
}

export interface SensorState {
  state: string
  numberState?: number
  time: Date
}
