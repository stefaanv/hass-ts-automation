import { StateUpdate } from './state-update.model'

export class ButtonPressed extends StateUpdate {
  type = 'ButtonPressed'

  constructor() {
    super()
  }

  override toString() {
    return `pressed  (${this.timeToString()})`
  }
}
export class ButtonReleased extends StateUpdate {
  type = 'ButtonReleased'

  constructor(/** in ms */ public readonly duration: number) {
    super()
  }

  override toString() {
    return `released after ${this.duration} ms`
  }
}
