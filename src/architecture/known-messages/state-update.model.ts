import { KnownContent } from '../message.model'

export abstract class StateUpdate extends KnownContent {
  constructor() {
    super()
  }
  type = 'StateUpdate'
}
