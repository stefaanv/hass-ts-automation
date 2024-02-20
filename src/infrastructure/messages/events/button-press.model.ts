import { time } from 'console'
import { EventMessage } from '../message.model'

export class ButtonPressed extends EventMessage<undefined> {
  toString() {
    return `Button "${this.entityId}" pressed`
  }
}
