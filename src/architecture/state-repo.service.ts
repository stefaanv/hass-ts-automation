import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { Message } from './message.model'
import { StateUpdate } from './known-messages/state-update.model'

@Injectable()
export class StateRepoService {
  private readonly _log: LoggerService
  private readonly _states: Record<string, StateUpdate[]> = {}

  constructor(
    private readonly _config: ConfigService,
    private readonly _eventEmitter: EventEmitter2,
  ) {
    this._log = new Logger(StateRepoService.name)
  }

  @OnEvent('driver.hass') //TODO: alle driver events
  receiveEvent(message: Message) {
    if (message.content instanceof StateUpdate) {
      const key = [message.origin, message.entity].join('.')
      if (!this._states[key]) this._states[key] = []
      this._states[key].unshift(message.content)
    }
    //TODO! oude states verwijderen
    //TODO! api om state history op te vragen
  }
}
