import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IntegrationBase } from '@src/infrastructure/loadable-base-classes/integration.base'
import { EventEmitter2 } from '@nestjs/event-emitter'
import {
  getAuth,
  createConnection,
  subscribeEntities,
  ERR_HASS_HOST_REQUIRED,
  Connection,
  createLongLivedTokenAuth,
  entitiesColl,
  getServices,
  HassService,
  HassServices,
} from 'home-assistant-js-websocket'
import { LightConfig } from './hass-lights/light.config'
import {
  LightState,
  LightStateEnum,
  LightStateUpdate,
} from '@src/infrastructure/messages/state-updates/light-state-update.model'
import { first, mapEntries, mapKeys, mapValues } from '@bruyland/utilities'
import { CommandMessage, Message } from '@src/infrastructure/messages/message.model'
import { ToggleLightCommand } from '@src/infrastructure/messages/commands/toggle-light.model'

const wnd = globalThis
wnd.WebSocket = require('ws')

const ignoreEntities = [
  'sensor.current_phase_1',
  'sensor.power_produced_phase_1',
  'sensor.voltage_phase_1',
  'sensor.power_produced',
  'sensor.power_consumed_phase_1',
  'sensor.power_consumed',
]

interface HassEventType {
  event_type: string
  context: {
    id: string
    parent_id: string | null
    user_is: string | null
  }
  data: {
    entity_id: string
    new_state: HassState
    old_state: HassState
  }
  origin: string
  time_fired: Date
}

interface HassState {
  attributes: HassLightStateAttributes
  context: object
  entity_id: string
  last_changed: Date
  last_updated: Date
  state: string
}

interface HassLightStateAttributes {
  brightness: number
}

const ID = 'hass'
export default class HassIntegration extends IntegrationBase {
  public name = 'Home Assistant websocket'
  public version = '0.0.1'
  public id = ID

  private _hassConnection?: Connection = undefined
  private _hassUrl: string
  private _hassToken: string
  private readonly _printCategories: string[] = []
  private readonly _lightConfig: Record</** internal entity name */ string, LightConfig>
  private readonly _lightStates: Record</** hass entity name */ string, LightState> = {}
  private readonly _lightStatePollingInterval: number
  private _services?: HassServices = undefined

  constructor(
    _integrationFileName: string, // first part of the filename of the driver
    eventEmitter: EventEmitter2,
    localConfig: any, // content of the config file with the same name as the driver file
    globalConfig: ConfigService,
  ) {
    super(ID, eventEmitter, localConfig, globalConfig)

    //get config
    this._lightConfig = this.getConfig<Record<string, LightConfig>>('lights', {})
    this._lightStatePollingInterval = this.getConfig('statePollingInterval', 5000)
    this._hassUrl = this.getConfig('baseUrl', '')
    this._hassToken = this.getConfig('authToken', '')
    this._printCategories = this.getConfig<string[]>('printCategories', [])
    this._lightStates = mapValues(this._lightConfig, (v, k) => new LightState())
  }

  override async start(): Promise<boolean> {
    const auth = createLongLivedTokenAuth(this._hassUrl, this._hassToken!)
    try {
      this._hassConnection = await createConnection({ auth })
      this._hassConnection!.subscribeEvents(e => this.hassStateChangeHandler(e as HassEventType))
      this._services = await getServices(this._hassConnection)
      return true
    } catch (error) {
      console.log(error)
    }
    // const coll = entitiesColl(connection)
    // console.log(coll.state)
    // await coll.refresh()
    // subscribeEntities(connection, ent => console.log(new Date()))
    return false
  }

  override async stop() {}

  override handleInternalMessage(message: Message) {
    if (message instanceof CommandMessage) {
      if (message instanceof ToggleLightCommand) {
        this._log.log(`toggling "${message.entity}" (from ${message.origin})`)
        this.toggleLight(message.entity)
      }
    }
  }

  public async toggleLight(entityId: string) {
    this.lightAction(entityId, 'toggle')
  }

  public async switch(entityId: string, newState: 'on' | 'off'): Promise<void> {
    this.lightAction(entityId, `turn_${newState}`)
  }

  private lightAction(entityId: string, action: string) {
    const hassEntityId = this.getHassEntityId(entityId)
    if (!hassEntityId) {
      this._log.warn(`Unable to ${action} ${entityId}, entity is not known`)
      return
    }
    this.serviceCall('light', action, hassEntityId)
  }

  private serviceCall(
    domain: string,
    service: string,
    hassEntityId: string,
    optionalServiceData: any = undefined,
  ) {
    this._hassConnection?.sendMessage({
      type: 'call_service',
      domain,
      service,
      service_data: optionalServiceData,
      target: {
        entity_id: hassEntityId,
      },
    })
  }

  private getHassEntityId(internalEntityId: string): string | undefined {
    const light = this._lightConfig[internalEntityId]
    if (light) return light.hassEntityId
    return undefined
  }

  private getEntityId(hassEntityId: string): string | undefined {
    const tuple = Object.entries(this._lightConfig).find(([, cfg]) => cfg.hassEntityId === hassEntityId)
    if (tuple) return tuple[0]
    return undefined
  }

  private hassStateChangeHandler(e: HassEventType) {
    try {
      if (Object.keys(e.data).length === 0) {
        // e.data is soms een leeg object !
        return
      }

      if ((e.data?.entity_id ?? '').startsWith('light')) {
        // capture light state changes
        this.handleLightStateChange(e.data.entity_id, e.data.new_state)
        return
      }
      /* print info
      if (
        e.data?.entity_id &&
        e.data.entity_id.split('.').length > 0 &&
        this._printCategories.includes(e.data.entity_id.split('.')[0])
      ) {
        console.log(e.data.entity_id, e.data.new_state.state, JSON.stringify(e.data.new_state.attributes))
      }
      */
    } catch (error) {
      console.error(`Error in hass.integration.ts > connection.subscribeEvents()`)
      console.error('e =', e)
    }
  }

  private handleLightStateChange(hassEntityId: string, hassState: HassState) {
    const entityId = this.getEntityId(hassEntityId)
    if (!entityId) {
      // this light entity is not in the configuration - skipping processing
      return
    }
    const oldState = this._lightStates[entityId]
    if (!oldState) {
      this._log.error(`light with entity id = ${entityId} not found in _lightStates object`)
      return
    }
    const newState = new LightState(hassState.state as LightStateEnum, hassState.attributes.brightness)
    if (hassState.state != 'on') newState.brightness = oldState.brightness
    if (!oldState.isEqual(newState)) {
      // this._log.verbose(`state of ${entityId} changed to ${newState.toString()}`)
      this.sendInternalMessage(new LightStateUpdate(this.id, entityId, newState))
      this._lightStates[entityId] = newState
    }
  }

  get debugInfo(): object {
    return { lightStates: this._lightStates }
  }
  get configInfo(): object {
    return {
      lightsConfig: this._lightConfig,
    }
  }
}
