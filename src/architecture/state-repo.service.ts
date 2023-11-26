import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { SensorStateUpdateEvent } from './sensor.model'

@Injectable()
export class StateRepoService {
  private readonly _log: LoggerService
  constructor(
    private readonly _config: ConfigService,
    private readonly _eventEmitter: EventEmitter2,
  ) {
    this._log = new Logger(StateRepoService.name)
  }

  @OnEvent('sensor.state')
  receiveEvent(payload: SensorStateUpdateEvent) {
    console.log(`${payload.entity} -> ${payload.numberState ?? payload.state} ${payload.unit}`)
  }
}
