import { IntegrationBase } from '@src/architecture/integration.base.js'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import axios, { Axios } from 'axios'
import { keys, tryit } from 'radash'

const logFilePath = 'C:\\Users\\stefa\\Documents\\projecten\\hass-ts-automation\\hass-driver.log'

interface LightState {
  on: boolean
  brightness: number
  reachable: boolean
}

export default class HassLightsIntegration extends IntegrationBase {
  public readonly name = 'Home Assistant Lights'
  public readonly version = '0.0.1'
  public readonly id = 'hass-lights'

  private readonly _axios: Axios
  private _lights: Record<string, string>
  private _states: Record<string, LightState> = {}
  private _statePollingInterval: number
  private _pollingJob: NodeJS.Timeout

  constructor(_driverFileName: string, localConfig: any, globalConfig: ConfigService) {
    // general setup
    super(localConfig, globalConfig)
    this._log = new Logger(this.name)

    //get config
    this._lights = this.getConfig<Record<string, string>>('lights', {})
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

  private setEmptyStates() {
    keys(this._lights).forEach(k => (this._states[k] = { on: false, brightness: 0, reachable: false }))
  }

  public async switch(lightName: string, newState: boolean): Promise<void> {
    if (!keys(this._lights).includes(lightName)) {
      this._log.error(`Light ${lightName} is not known`)
      return
    }
    const oldState = this._states[lightName].on
    if (oldState === newState) return
    const data = { entity_id: `light.${this._lights[lightName]}` }
    const url = `services/light/turn_${newState ? 'on' : 'off'}`
    const [error, result] = await tryit(this._axios.post)(url, data)
    if (error) {
      this._log.error(error)
      return
    }
    this._log.verbose(`switch - state of ${lightName} changed to ${JSON.stringify(newState) ? 'on' : 'off'}`)
    this._states[lightName].on = newState
  }

  public async toggle(lightName: string) {
    if (!keys(this._lights).includes(lightName)) {
      console.error(`Light ${lightName} is not known`)
      return
    }
    const oldState = this._states[lightName].on
    await this.switch(lightName, !oldState)
  }

  public async getLightStates(): Promise<void> {
    for await (const key of keys(this._lights)) {
      const [error, result] = await tryit(this._axios.get)(`states/light.${this._lights[key]}`)
      if (error) {
        this._log.error(error)
      } else {
        const newState = result?.data?.state === 'on'
        const oldState = this._states[key].on
        if (newState !== oldState) {
          // light state changed !
          this._log.verbose(`getLightStates - state of ${key} changed to ${newState ? 'on' : 'off'}`)
          this._states[key].on = newState
        }
      }
    }
  }

  get debugInfo(): object {
    return {}
  }
}
