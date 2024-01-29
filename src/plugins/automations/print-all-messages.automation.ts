import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { AutomationBase } from '@architecture/automation.base'
import { Message } from '@architecture/messages/message.model'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'

export default class MessagePrinter extends AutomationBase {
  public name = 'Print all messages'
  public version = '0.0.1'
  public id = 'print-all'

  constructor(
    _automationFileName: string,
    eventEmitter: EventEmitter2,
    localConfig: any,
    globalConfig: ConfigService,
  ) {
    super(eventEmitter, localConfig, globalConfig)
    this._log = new Logger(MessagePrinter.name)
    this._eventEmitter.on('**', event => this.listenToIntegrationEvents(event))
  }

  async start(): Promise<boolean> {
    // does nothing
    return true
  }
  async stop(): Promise<void> {
    //does nothing
  }

  @OnEvent('**')
  listenToIntegrationEvents(message: Message) {
    const msg = message.toString()
    this._log.log(message.constructor.name + ' -> ' + msg.toString())
  }
}
