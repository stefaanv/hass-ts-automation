import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { SensorStateUpdate } from './known-messages/sensor.model'
import { Message } from './message.model'

@Injectable()
export class StateRepoService {
  private readonly _log: LoggerService
  constructor(
    private readonly _config: ConfigService,
    private readonly _eventEmitter: EventEmitter2,
  ) {
    this._log = new Logger(StateRepoService.name)
  }

  @OnEvent('driver.hass')
  receiveEvent(message: Message) {
    console.log(message.toString())
  }
}
