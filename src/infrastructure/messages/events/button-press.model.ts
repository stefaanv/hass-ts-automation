import { EventMessage } from '../message.model'
type ButtonPressEdgeType = 'pressed' | 'released'
interface ButtonPressPayload {
  type: ButtonPressEdgeType
  duration?: number
}

export class ButtonPressed extends EventMessage<ButtonPressPayload> {
  toString() {
    return `Button "${this.entityId}" ${this.payload.type}` + this.payload.type === 'released'
      ? `released after ${this.payload.duration} ms`
      : ''
  }
}
