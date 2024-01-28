import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IntegrationLoader } from './architecture/integration-loader.service'
@Injectable()
export class AppService {
  private readonly _log: LoggerService

  constructor(private readonly _loaderService: IntegrationLoader) {
    this._log = new Logger(AppService.name)
  }

  debugInfo() {
    return this._loaderService.getAllDebugInfo()
  }
}
