import { EventMessage } from '../message.model'

export class ButtonReleased extends EventMessage {
  constructor(
    origin: string,
    entityId: string,
    /** duration of the press in ms */ public readonly duration: number,
    timestamp = new Date(),
  ) {
    super(origin, entityId, timestamp)
  }

  toString() {
    return `Button "${this.entityId}" released after ${this.duration} ms`
  }
}
