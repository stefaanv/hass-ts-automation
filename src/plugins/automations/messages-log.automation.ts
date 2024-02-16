import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { AutomationBase } from '@src/infrastructure/loadable-base-classes/automation.base'
import { Message } from '@infrastructure/messages/message.model'
import { ConfigService } from '@nestjs/config'

const ID = 'msg-logger'
export default class MessageLogger extends AutomationBase {
  public name = 'Log all messages'
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

  async start(): Promise<boolean> {
    // does nothing
    return true
  }
  async stop(): Promise<void> {
    //does nothing
  }

  override handleInternalMessage(message: Message) {
    const msg = message.toString()
    this._log.log(message.constructor.name + ' -> ' + msg.toString())
  }

  get debugInfo() {
    return undefined
  }
  get configInfo() {
    return { active: true }
  }
}
