import { KnownContent } from '../message.model'

export abstract class StateUpdate extends KnownContent {
  constructor(timestamp = new Date()) {
    super(timestamp)
  }
}
