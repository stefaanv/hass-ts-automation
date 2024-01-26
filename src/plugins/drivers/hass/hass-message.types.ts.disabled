interface AuthRequestMsg {
  type: 'auth_required'
  ha_version: string
}

interface AuthApprovalMsg {
  type: 'auth_ok'
  ha_version: string
}

interface AuthFailedMsg {
  type: 'auth_invalid'
  message: string
}

export interface CommandResultMsg {
  type: 'result'
  id: number
  success: boolean
  result: any
  error: any
}

interface CommandContext {
  id: string
  parent_id: string | null
  user_id: string | null
}

export interface EventInfo {
  event_type: 'state_changed'
  data: {
    entity_id: string
    old_state: State
    new_state: State
  }
  origin: string
  time_fired: string
  context: CommandContext
}

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

interface AuthRequest {
  type: 'auth'
  access_token: string
}

interface SubscribeMsg {
  id: number
  type: 'subscribe_events'
  event_type: 'state_changed'
}

export type IncomingMessage =
  | AuthRequestMsg
  | AuthApprovalMsg
  | AuthFailedMsg
  | CommandResultMsg
  | StateChangeEvent
export type OutgoingMessage = AuthRequest | SubscribeMsg
