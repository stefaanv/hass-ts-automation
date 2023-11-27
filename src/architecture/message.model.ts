export class Message<T = UnknownContent> {
  constructor(
    public origin: string,
    public entity: string,
    public content: T,
  ) {}
  toString() {
    const strContent =
      this.content instanceof KnownContent
        ? this.content.toString()
        : JSON.stringify(this.content).slice(0, 100)
    return `${this.entity} (${this.origin}) = ${strContent}`
  }
}

export type UnknownContent = any

export abstract class KnownContent {
  constructor(public time: Date = new Date()) {}
  abstract toString(): string
}
