import { EventMessage } from '../message.model'

export class ButtonPressed extends EventMessage {
  constructor(origin: string, entity: string, timestamp = new Date()) {
    super(origin, entity, timestamp)
  }

  toString() {
    return `Button "${this.entity}" pressed`
  }
}
