import { green, whiteBright, yellow } from 'ansi-colors'

export interface IMessageContent {
  type: string
  timestamp: Date
}

export class Message<T extends IMessageContent = UnknownContent> {
  constructor(
    public origin: string,
    public entity: string,
    public content: T,
  ) {}
  toString() {
    const strContent =
      this.content instanceof KnownContent
        ? whiteBright(this.content.toString()) + '   ' + green(this.content.timeToString())
        : JSON.stringify(this.content).slice(0, 100)
    return green(`${yellow(this.entity)} (${this.origin} / ${this.content.type}) = ${strContent}`)
  }
}

export type UnknownContent = any & IMessageContent

export abstract class KnownContent implements IMessageContent {
  type = 'KnownContent'
  public timestamp: Date
  timeToString() {
    return `@ ${this.timestamp.toLocaleTimeString()}`
  }

  abstract toString(): string
}
