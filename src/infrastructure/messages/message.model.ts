export abstract class Message {
  constructor(
    /** orignation integration name */ public origin: string,
    /** globally unique entity name */ public entityId: string,
    /** timestamp of message creation */ public timestamp = new Date(),
  ) {}
  /** string representation of the message content (without timestamp, origin and entity) */
  abstract toString(): string
}

export abstract class StateUpdate<TState> extends Message {
  constructor(
    origin: string,
    entityId: string,
    public state: TState,
    timestamp = new Date(),
  ) {
    super(origin, entityId, timestamp)
  }
}

export abstract class EventMessage<TPayload> extends Message {
  constructor(
    origin: string,
    entityId: string,
    public payload: TPayload,
    timestamp = new Date(),
  ) {
    super(origin, entityId, timestamp)
  }
}

export abstract class CommandMessage<TCommand> extends Message {
  constructor(
    origin: string,
    entityId: string,
    public command: TCommand,
    timestamp = new Date(),
  ) {
    super(origin, entityId, timestamp)
  }
}
