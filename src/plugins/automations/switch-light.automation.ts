import { EventEmitter2 } from '@nestjs/event-emitter'
import { AutomationBase } from '@src/infrastructure/loadable-base-classes/automation.base'
import { Message } from '@infrastructure/messages/message.model'
import { ConfigService } from '@nestjs/config'
import { ButtonPressed } from '@src/infrastructure/messages/events/button-press.model'
import { ToggleLightCommand } from '@src/infrastructure/messages/commands/toggle-light.model'

interface SwitchLightConnection {
  switch: string
  lights: string[]
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
    this._singleButtonToggle = this.getConfig('single-button-toggle', [])
  }

  async start(): Promise<boolean> {
    // do nothing
    return true
  }
  async stop(): Promise<void> {
    //do nothing
  }

  override handleInternalMessage(message: Message) {
    if (message instanceof ButtonPressed && message.payload.type === 'pressed') {
      for (const connection of this._singleButtonToggle) {
        if (message.entityId === connection.switch) {
          connection.lights.forEach(entityId => {
            this._log.verbose(`Toggling light ${entityId} by ${connection.switch}`)
            this.sendInternalMessage(new ToggleLightCommand(this.id, entityId, undefined))
          })
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
