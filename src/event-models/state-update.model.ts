import { KnownContent } from '../architecture/message.model'

export abstract class StateUpdate extends KnownContent {
  constructor(timestamp = new Date()) {
    super(timestamp)
  }
}
