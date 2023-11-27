import { KnownContent } from '../message.model'

export abstract class StateUpdate extends KnownContent {
  type = 'StateUpdate'
}
