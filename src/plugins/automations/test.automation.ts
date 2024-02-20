import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { AutomationBase } from '@src/infrastructure/loadable-base-classes/automation.base'
import { Message } from '@src/infrastructure/messages/message.model'

const ID = 'test-autom'

export default class TestAutomation extends AutomationBase {
  public name = 'Test automation'
  public version = '0.0.1'
  public id = ID

  constructor(
    _automationFileName: string,
    eventEmitter: EventEmitter2,
    localConfig: any,
    globalConfig: ConfigService,
  ) {
    super(ID, eventEmitter, localConfig, globalConfig)
  }

  override handleInternalMessage(message: Message) {
    console.log(this.name, message.entityId)
  }

  async start() {
    return true
  }
  async stop() {
    //
  }
  get debugInfo() {
    return undefined
  }
  get configInfo() {
    return undefined
  }
}
