import { EventInfo } from './hass-message.types'

export interface State {
  entity_id: string
  state: string
  attributes: StateChangeAttributes
  last_changed: string
  last_updated: string
  context: StateChangeContext
}

export interface StateChangeAttributes {
  state_class: string
  unit_of_measurement?: string
  device_class: string
  friendly_name: string
}

export interface StateChangeContext {
  id: string
  parent_id: string | null
  user_id: string | null
}

export interface StateChangeEvent {
  type: 'event'
  event: EventInfo
  id: number
}

export interface SubscribeMsg {
  id: number
  type: 'subscribe_events'
  event_type: 'state_changed'
}
