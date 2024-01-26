export abstract class Message {
  constructor(
    /** origin driver name */ public origin: string,
    /** (hass) entity name */ public entityName: string,
    /** timestamp of message creation */ public timestamp = new Date(),
  ) {}

  /** string representation of the message content (without timestamp, origin and entity) */
  stateToString() {
    return JSON.stringify(this)
  }
}
