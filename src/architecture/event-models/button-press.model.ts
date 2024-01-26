import { Message } from './message.model'

export class ButtonPressed extends Message {
  constructor(origin: string, entityName: string, timestamp = new Date()) {
    super(origin, entityName, timestamp)
  }

  stateToString() {
    return `Button ${this.entityName} pressed at ${this.timestamp.toLocaleTimeString()}`
  }
}
