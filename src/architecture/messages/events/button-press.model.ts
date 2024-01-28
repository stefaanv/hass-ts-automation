import { EventMessage, StateUpdate } from '../message.model'

export class ButtonPressed extends EventMessage {
  constructor(origin: string, entityName: string, timestamp = new Date()) {
    super(origin, entityName, timestamp)
  }

  toString() {
    return `Button "${this.entityName}" pressed`
  }
}
