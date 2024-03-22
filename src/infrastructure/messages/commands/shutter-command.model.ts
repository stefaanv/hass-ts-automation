import { CommandMessage } from '../message.model'

export class ShutterCommand extends CommandMessage<number> {
  toString() {
    return `Move shutter "${this.entityId}" to ${this.target}% closed`
  }
}
