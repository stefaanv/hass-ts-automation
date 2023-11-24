import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { whiteBright } from 'ansi-colors'

@Injectable()
export class AppService {
  private readonly _log: LoggerService

  constructor(config: ConfigService) {
    this._log = new Logger(AppService.name)
  }
  getHello(): string {
    return 'Hello World!'
  }
}
