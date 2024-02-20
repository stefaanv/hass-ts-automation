export interface HassEventType {
  event_type: string
  context: {
    id: string
    parent_id: string | null
    user_id: string | null
  }
  data: {
    entity_id: string
    new_state: HassState
    old_state: HassState
  }
  origin: string
  time_fired: Date
}

export interface HassState {
  attributes: object
  context: object
  entity_id: string
  last_changed: Date
  last_updated: Date
  state: string
}
