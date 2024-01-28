import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { EventMessage, Message, StateUpdate } from './event-models/message.model'

@Injectable()
export class AutomationService {
  private readonly _log: LoggerService
  constructor(
    private readonly _config: ConfigService,
    private readonly _eventEmitter: EventEmitter2,
  ) {
    this._log = new Logger(AutomationService.name)
  }

  //TODO - nog in loadable script duwen
  @OnEvent('**')
  listenToIntegrationEvents(message: Message) {
    if (message instanceof EventMessage) {
      const msg = message.toString()
      this._log.debug!(msg)
    }
  }
}
