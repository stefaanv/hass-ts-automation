import { CommandMessage } from '../message.model'

export class ToggleLightCommand extends CommandMessage {
  constructor(origin: string, entity: string, timestamp = new Date()) {
    super(origin, entity, timestamp)
  }

  toString() {
    return `Switch light "${this.entity}" command`
  }
}
