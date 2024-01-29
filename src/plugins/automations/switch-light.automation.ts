import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { AutomationBase } from '@src/infrastructure/loadable-base-classes/automation.base'
import { Message } from '@infrastructure/messages/message.model'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import { ButtonPressed } from '@src/infrastructure/messages/events/button-press.model'
import { ToggleLightCommand } from '@src/infrastructure/messages/commands/toggle-light.model'

interface SwitchLightConnection {
  switch: string
  light: string
}

export default class SwitchLights extends AutomationBase {
  public name = 'Switch lights'
  public version = '0.0.1'
  public id = 'switch-lights'
  private _singleButtonOnOff: SwitchLightConnection[]

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
    this._singleButtonOnOff = this.getConfig('single-button-on-off', [])
  }

  async start(): Promise<boolean> {
    // does nothing
    return true
  }
  async stop(): Promise<void> {
    //does nothing
  }

  onMessage(message: Message) {
    if (message instanceof ButtonPressed) {
      console.log(message.entity)
      for (const connection of this._singleButtonOnOff) {
        if (message.entity === connection.switch)
          this.sendMessage(new ToggleLightCommand(this.id, connection.light))
      }
    }
  }
}
