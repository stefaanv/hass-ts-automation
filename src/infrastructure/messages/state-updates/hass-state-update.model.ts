import { StateUpdate } from '../message.model'

export interface HassStateAttributesBase {
  state_class: string
  unit_of_measurement?: string
  device_class: string
  friendly_name: string
}

export interface HassLightLevelStateAttributes extends HassStateAttributesBase {
  on: boolean
  dark: boolean
  daylight: boolean
}

export interface HassLightState extends HassStateAttributesBase {
  brightness: number
}

export type HassStateAttributes = HassStateAttributesBase | HassLightLevelStateAttributes

export interface HassState {
  attributes: HassStateAttributes
  context: object
  entity_id: string
  last_changed: Date
  last_updated: Date
  state: string
}

export interface HassData {
  entity_id: string
  new_state: HassState
  old_state: HassState
}

export interface HassEvent {
  event_type: string
  context: {
    id: string
    parent_id: string | null
    user_id: string | null
  }
  data: HassData
  origin: string
  time_fired: Date
}

export class HassStateUpdate extends StateUpdate<HassEvent> {
  toString() {
    const stateData = this.state.data
    return `(hass) ${stateData?.entity_id} = ${stateData?.new_state?.state} ${
      stateData?.new_state?.attributes?.unit_of_measurement ?? ''
    }`
  }
}
