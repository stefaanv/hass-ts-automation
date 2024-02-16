import { CommandContext, CommandResultMsg } from './command-messages.model'
import { State, StateChangeEvent, SubscribeMsg } from './state-messages.model'

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

export type IncomingMessage =
  | AuthRequestMsg
  | AuthApprovalMsg
  | AuthFailedMsg
  | CommandResultMsg
  | StateChangeEvent
export type OutgoingMessage = AuthRequest | SubscribeMsg
