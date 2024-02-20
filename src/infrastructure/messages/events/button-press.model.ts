import { EventMessage } from '../message.model'

export class ButtonPressed extends EventMessage {
  constructor(origin: string, entityId: string, timestamp = new Date()) {
    super(origin, entityId, timestamp)
  }

  toString() {
    return `Button "${this.entityId}" pressed`
  }
}
