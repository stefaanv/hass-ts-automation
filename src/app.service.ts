import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { IntegrationLoader } from './infrastructure/loaders/integration-loader.service'
import { AutomationLoader } from './infrastructure/loaders/automation-loader.service'

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

  configInfo() {
    return {
      integrations: this._integrations.getAllConfigInfo(),
      automations: this._automations.getAllConfigInfo(),
    }
  }
}
