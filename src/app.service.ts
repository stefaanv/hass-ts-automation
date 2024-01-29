import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { IntegrationLoader } from './architecture/loaders/integration-loader.service'
import { AutomationLoader } from './architecture/loaders/automation-loader.service'

@Injectable()
export class AppService {
  private readonly _log: LoggerService

  constructor(
    private readonly _integrations: IntegrationLoader,
    private readonly _automations: AutomationLoader,
  ) {
    this._log = new Logger(AppService.name)
  }

  debugInfo() {
    return {
      integrations: this._integrations.getAllDebugInfo(),
      automations: this._automations.getAllDebugInfo(),
    }
  }
}
