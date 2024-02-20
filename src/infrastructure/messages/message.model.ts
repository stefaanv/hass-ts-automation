export abstract class Message {
  constructor(
    /** orignation integration name */ public origin: string,
    /** globally unique entity name */ public entityId: string,
    /** timestamp of message creation */ public timestamp = new Date(),
  ) {}
  /** string representation of the message content (without timestamp, origin and entity) */
  abstract toString(): string
}

export abstract class StateUpdate<TState extends object = any> extends Message {
  constructor(
    /** orignation integration name */ origin: string,
    /** globally unique entity name */ entityId: string,
    public readonly state: TState,
    /** timestamp of message creation */ timestamp = new Date(),
  ) {
    super(origin, entityId, timestamp)
  }
}

export abstract class EventMessage extends Message {
  constructor(
    /** orignation integration name */ origin: string,
    /** globally unique entity name */ entityId: string,
    /** timestamp of message creation */ timestamp = new Date(),
  ) {
    super(origin, entityId, timestamp)
  }
}

export abstract class CommandMessage extends Message {
  constructor(
    /** orignation integration name */ origin: string,
    /** globally unique entity name */ entityId: string,
    /** timestamp of message creation */ timestamp = new Date(),
  ) {
    super(origin, entityId, timestamp)
  }
}
