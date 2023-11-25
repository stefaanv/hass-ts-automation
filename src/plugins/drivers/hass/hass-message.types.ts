interface AuthRequestMsg {
  type: 'auth_required'
  ha_version: string
}

interface AuthApprovalMsg {
  type: 'auth_ok'
  ha_version: string
}

interface CommandResultMsg {
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
    old_state: any
    new_state: any
  }
  origin: string
  time_fired: string
  context: CommandContext
}

interface StateChangeEvent {
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

export type IncomingMessage = AuthRequestMsg | AuthApprovalMsg | CommandResultMsg | StateChangeEvent
export type OutgoingMessage = AuthRequest | SubscribeMsg
