import { CommandMessage } from '../message.model'

export class ToggleLightCommand extends CommandMessage {
  constructor(origin: string, entityId: string, timestamp = new Date()) {
    super(origin, entityId, timestamp)
  }

  toString() {
    return `Switch light "${this.entityId}" command`
  }
}
