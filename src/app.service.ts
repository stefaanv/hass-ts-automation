import { Injectable, Logger, LoggerService } from '@nestjs/common'
import { IntegrationLoader } from './infrastructure/loaders/integration-loader.service'
import { AutomationLoader } from './infrastructure/loaders/automation-loader.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Message } from './infrastructure/messages/message.model'

@Injectable()
export class AppService {
  private readonly _log: LoggerService

  constructor(
    private readonly _eventEmitter: EventEmitter2,
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

  sendMessage(entityId: string, message: Message) {
    this._eventEmitter.emit(entityId, message)
  }
}
