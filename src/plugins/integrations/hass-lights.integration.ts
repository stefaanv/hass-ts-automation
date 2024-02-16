import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import axios, { Axios } from 'axios'
import { keys, tryit } from 'radash'
import { IntegrationBase } from '@src/infrastructure/loadable-base-classes/integration.base'
import {
  LightState,
  LightStateEnum,
  LightStateUpdate,
} from '@infrastructure/messages/state-updates/light-state-update.model'
import { LightConfig } from './hass-lights/light.config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { CommandMessage, Message } from '@src/infrastructure/messages/message.model'
import { ToggleLightCommand } from '@src/infrastructure/messages/commands/toggle-light.model'

const ID = 'hass-lights'
export default class HassLightsIntegration extends IntegrationBase {
  public readonly name = 'Home Assistant Lights'
  public readonly version = '0.0.1'
  public readonly id = ID

  private readonly _axios: Axios
  private _lights: Record<string, LightConfig>
  private _states: Record<string, LightState> = {}
  private _statePollingInterval: number
  private _pollingJob?: NodeJS.Timeout

  //TODO! setup nog laden uit configuratie
  constructor(
    _integrationFileName: string,
    eventEmitter: EventEmitter2,
    localConfig: any,
    globalConfig: ConfigService,
  ) {
    // general setup
    super(ID, eventEmitter, localConfig, globalConfig)

    //get config
    this._lights = this.getConfig<Record<string, LightConfig>>('lights', {})
    this._statePollingInterval = this.getConfig('statePollingInterval', 5000)
    const baseURL = this.getConfig('baseUrl', '')
    const authToken = this.getConfig('authToken', '')
    // create Axios instance from config
    this._axios = axios.create({
      baseURL,
      responseType: 'json',
      headers: {
        Authorization: 'Bearer ' + authToken,
        'content-type': 'application/json',
      },
    })

    this.setEmptyStates()
    this.getLightStates()
  }

  async start() {
    // start listening to `light` commands
    this._pollingJob = setInterval(() => this.getLightStates(), this._statePollingInterval)
    return true
  }

  async stop() {
    clearInterval(this._pollingJob)
  }

  override handleInternalMessage(message: Message) {
    if (message instanceof CommandMessage) {
      if (message instanceof ToggleLightCommand) {
        this._log.log(`toggling "${message.entity}" (from ${message.origin})`)
        this.toggle(message.entity)
      }
    }
  }

  private setEmptyStates() {
    Object.keys(this._lights).forEach(k => (this._states[k] = new LightState()))
  }

  public async switch(entityName: string, newState: 'on' | 'off'): Promise<void> {
    if (!Object.keys(this._lights).includes(entityName)) {
      this._log.warn(`Light ${entityName} is not known, no action taken`)
      return
    }
    const oldState = this._states[entityName]
    if (!oldState.state || oldState.state === 'unreachable') {
      this._log.warn(`Light ${entityName} is not reachable, no action taken`)
      return
    }
    if (oldState.state === newState) return

    const hassEntityId = this._lights[entityName].hassEntityId
    const data = { entity_id: `light.${hassEntityId}` }
    const url = `services/light/turn_${newState ? 'on' : 'off'}`
    const [error, result] = await tryit(this._axios.post)(url, data)
    if (error) {
      this._log.error(error.message)
      return
    }
    const changedState = LightState.clone(oldState)
    changedState.state = newState
    this.reportStateChange(entityName, changedState)
  }

  public async toggle(entityName: string) {
    const oldState: LightState = this._states[entityName]
    if (!oldState.isKnownAndReachable) {
      this._log.warn(`unable to toggle ${oldState.state} state on light "${entityName}"`)
      return
    }
    await this.switch(entityName, oldState.state === 'on' ? 'off' : 'on')
  }

  public async getLightStates(): Promise<void> {
    for await (const key of Object.keys(this._lights)) {
      const lightConfig = this._lights[key]
      const [error, result] = await tryit(this._axios.get)(`states/light.${lightConfig.hassEntityId}`)
      if (error) {
        this._log.error(error)
      } else {
        const hassLightStateObject = result?.data
        if (hassLightStateObject) {
          const oldState = this._states[key]
          const newState = LightState.clone(oldState)
          newState.state = hassLightStateObject.state
          if (hassLightStateObject.state == 'on')
            newState.brightness = hassLightStateObject.attributes?.brightness
          this.reportStateChange(key, newState)
        }
      }
    }
  }

  reportStateChange(key: string, newState: LightState) {
    const oldState = this._states[key]
    if (!newState.isEqual(oldState)) {
      // light state changed !
      this._log.verbose(`state of ${key} changed to ${newState.toString()}`)
      this._states[key] = newState
      this.sendInternalMessage(new LightStateUpdate(this.id, key, newState))
    }
  }

  get debugInfo(): object {
    return { states: this._states }
  }
  get configInfo(): object {
    return { config: this.configInfo }
  }
}
