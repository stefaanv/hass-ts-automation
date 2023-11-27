import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { Message } from './message.model'
import { StateUpdate } from './known-messages/state-update.model'
import { isAfter, subMinutes } from 'date-fns'
import { first, mapEntries } from 'radash'

@Injectable()
export class StateRepoService {
  private readonly _log: LoggerService
  private readonly _history: Record<string, StateUpdate[]> = {}
  private readonly keepMaxNumber: number
  private readonly keepMinNumber: number
  private readonly keepMaxMinutes: number

  constructor(
    private readonly _config: ConfigService,
    private readonly _eventEmitter: EventEmitter2,
  ) {
    this._log = new Logger(StateRepoService.name)
  }

  @OnEvent('driver.*') //TODO: alle driver events
  receiveEvent(message: Message) {
    if (message.content instanceof StateUpdate) {
      const entity = message.entity
      if (!this._history[entity]) this._history[entity] = []
      this._history[entity].unshift(message.content)
      this.clearSingle(entity)
    }
    //TODO! api om state history op te vragen
  }

  clearSingle(entity: string) {
    const history = this._history[entity]
    const horizon = subMinutes(new Date(), this.keepMaxMinutes)
    const withinHorizon = history.filter(s => isAfter(s.timestamp, horizon)).length
    const toKeep = Math.max(Math.min(this.keepMaxNumber, withinHorizon), this.keepMinNumber)
    history.slice(0, toKeep)
  }

  get currentStates() {
    return mapEntries(this._history, (k, v) => [k, first(v)])
  }
}
