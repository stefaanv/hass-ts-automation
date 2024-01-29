import { EventMessage, StateUpdate } from '../message.model'

export class ButtonReleased extends EventMessage {
  constructor(
    origin: string,
    entity: string,
    /** duration of the press in ms */ public readonly duration: number,
    timestamp = new Date(),
  ) {
    super(origin, entity, timestamp)
  }

  toString() {
    return `Button "${this.entity}" released after ${this.duration} ms`
  }
}
