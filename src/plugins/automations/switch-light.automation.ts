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

const ID = 'switch-lights'
export default class SwitchLights extends AutomationBase {
  public name = 'Switch lights'
  public version = '0.0.1'
  public id = ID
  private _singleButtonToggle: SwitchLightConnection[]

  //TODO setup nog laden uit configuratie
  constructor(
    _automationFileName: string,
    eventEmitter: EventEmitter2,
    localConfig: any,
    globalConfig: ConfigService,
  ) {
    super(ID, eventEmitter, localConfig, globalConfig)
    this._singleButtonToggle = this.getConfig('single-button-on-off', [])
  }

  async start(): Promise<boolean> {
    // does nothing
    return true
  }
  async stop(): Promise<void> {
    //does nothing
  }

  override handleInternalMessage(message: Message) {
    if (message instanceof ButtonPressed) {
      // console.log(message.entity)
      for (const connection of this._singleButtonToggle) {
        if (message.entity === connection.switch) {
          this._log.verbose(`Toggling light ${this.id}`)
          this.sendInternalMessage(new ToggleLightCommand(this.id, connection.light))
        }
      }
    }
  }

  get debugInfo() {
    return undefined
  }
  get configInfo() {
    return {
      ingleButtonToggle: this._singleButtonToggle,
    }
  }
}
