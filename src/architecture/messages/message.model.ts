export abstract class Message {
  constructor(
    /** orignation integration name */ public origin: string,
    /** globally unique entity name */ public entityName: string,
    /** timestamp of message creation */ public timestamp = new Date(),
  ) {}
  abstract typePrefix: string
  /** string representation of the message content (without timestamp, origin and entity) */
  abstract toString(): string
}

export abstract class StateUpdate extends Message {
  typePrefix = 'state.'
  constructor(
    /** orignation integration name */ origin: string,
    /** globally unique entity name */ entityName: string,
    /** timestamp of message creation */ timestamp = new Date(),
  ) {
    super(origin, entityName, timestamp)
  }
}

export abstract class EventMessage extends Message {
  typePrefix = 'event.'
  constructor(
    /** orignation integration name */ origin: string,
    /** globally unique entity name */ entityName: string,
    /** timestamp of message creation */ timestamp = new Date(),
  ) {
    super(origin, entityName, timestamp)
  }
}

export abstract class CommandMessage extends Message {
  typePrefix = 'command.'
  constructor(
    /** orignation integration name */ origin: string,
    /** globally unique entity name */ entityName: string,
    /** timestamp of message creation */ timestamp = new Date(),
  ) {
    super(origin, entityName, timestamp)
  }
}
