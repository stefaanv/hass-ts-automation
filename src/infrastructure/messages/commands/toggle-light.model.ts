import { CommandMessage } from '../message.model'

export class ToggleLightCommand extends CommandMessage<undefined> {
  toString() {
    return `Switch light "${this.entityId}" command`
  }
}
