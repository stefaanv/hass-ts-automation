export abstract class Message {
  constructor(
    /** orignation integration name */ public origin: string,
    /** globally unique entity name */ public entityName: string,
    /** timestamp of message creation */ public timestamp = new Date(),
  ) {}
  /** string representation of the message content (without timestamp, origin and entity) */
  abstract toString(): string
}

export abstract class StateUpdate extends Message {
  constructor(
    /** orignation integration name */ origin: string,
    /** globally unique entity name */ entityName: string,
    /** timestamp of message creation */ timestamp = new Date(),
  ) {
    super(origin, entityName, timestamp)
  }
}

export abstract class EventMessage extends Message {
  constructor(
    /** orignation integration name */ origin: string,
    /** globally unique entity name */ entityName: string,
    /** timestamp of message creation */ timestamp = new Date(),
  ) {
    super(origin, entityName, timestamp)
  }
}
