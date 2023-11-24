import { Injectable, LoggerService } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class AutomationServiceService {
  constructor(
    private readonly _config: ConfigService,
    private readonly _log: LoggerService,
    private readonly _eventEmitter: EventEmitter2,
  ) {}
}
