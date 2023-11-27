import { KnownContent } from '../message.model'

export class ButtonPressed extends KnownContent {
  constructor() {
    super()
  }

  override toString() {
    return `pressed`
  }
}
export class ButtonReleased extends KnownContent {
  constructor(/** in ms */ public readonly duration: number) {
    super()
  }

  override toString() {
    return `released after ${this.duration} ms`
  }
}
