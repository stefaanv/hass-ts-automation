import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { AutomationBase } from '@src/architecture/loadable-base-classes/automation.base'
import { Message } from '@architecture/messages/message.model'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import { ButtonPressed } from '@src/architecture/messages/events/button-press.model'
import { ToggleLightCommand } from '@src/architecture/messages/commands/toggle-light.model'

export default class SwitchLights extends AutomationBase {
  public name = 'Switch lights'
  public version = '0.0.1'
  public id = 'switch-lights'

  //TODO setup nog laden uit configuratie
  constructor(
    _automationFileName: string,
    eventEmitter: EventEmitter2,
    localConfig: any,
    globalConfig: ConfigService,
  ) {
    super(eventEmitter, localConfig, globalConfig)
    this._log = new Logger(SwitchLights.name)
    this._eventEmitter.on('**', message => this.onMessage(message))
  }

  async start(): Promise<boolean> {
    // does nothing
    return true
  }
  async stop(): Promise<void> {
    //does nothing
  }

  onMessage(message: Message) {
    if (message instanceof ButtonPressed && message.entity === 'sw-bureau-deur-B1') {
      this.sendMessage(new ToggleLightCommand(this.id, 'slaapkamer4'))
    }
  }
}
