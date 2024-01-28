import { EventMessage, StateUpdate } from './message.model'

export class ButtonReleased extends EventMessage {
  constructor(
    origin: string,
    entityName: string,
    /** duration of the press in ms */ public readonly duration: number,
    timestamp = new Date(),
  ) {
    super(origin, entityName, timestamp)
  }

  toString() {
    return `Button "${this.entityName}" released after ${this.duration} ms`
  }
}
