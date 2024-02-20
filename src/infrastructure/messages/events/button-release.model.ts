import { EventMessage } from '../message.model'

export class ButtonReleased extends EventMessage<{ duration: number }> {
  toString() {
    return `Button "${this.entityId}" released after ${this.payload.duration} ms`
  }
}
