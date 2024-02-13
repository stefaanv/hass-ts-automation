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
import { mapEntries, mapKeys, mapValues } from '@bruyland/utilities'
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

export default class HassIntegration extends IntegrationBase {
  public name = 'Home Assistant websocket'
  public version = '0.0.1'
  public id = 'hass'

  private _hassConnection?: Connection = undefined
  private _hassUrl: string
  private _hassToken: string
  private _stateRepo: Record<string, object> = {}
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
    super(eventEmitter, localConfig, globalConfig)
    this._log = new Logger(HassIntegration.name)

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
      this._eventEmitter.on('**', msg => this.onEvent(msg))
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

  onEvent(message: Message) {
    if (message instanceof CommandMessage) {
      if (message instanceof ToggleLightCommand) {
        this._log.log(`toggling "${message.entity}" (from ${message.origin})`)
        this.toggleLight(message.entity)
      }
    }
  }

  public async toggleLight(entityName: string) {
    const oldState: LightState = this._lightStates[entityName]
    if (!oldState.isKnownAndReachable) {
      this._log.warn(`unable to toggle ${oldState.state} state on light "${entityName}"`)
      return
    }
    const toggleService = this._services?.light?.toggle //TODO!!!
    await this.switch(entityName, oldState.state === 'on' ? 'off' : 'on')
  }

  public async switch(entityId: string, newState: 'on' | 'off'): Promise<void> {
    console.log(`HASS integration - switching ${entityId} to "${newState}"`)
    const hassEntityId = this._lightConfig[entityId]
    const hassState = `turn_${newState}`
    this._hassConnection?.sendMessage({
      id: 1,
      type: 'call_service',
      domain: 'light',
      service: 'turn_on',
      // Optional
      // "service_data": {
      //   "color_name": "beige",
      //   "brightness": "101"
      // },
      // Optional
      target: {
        entity_id: hassEntityId,
      },
    })
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
    const result = Object.entries(this._lightConfig).find(
      ([key, value]) => value.hassEntityId === hassEntityId,
    )
    if (!result) {
      // this light entity is not in the configuration - skipping processing
      return
    }
    const [entityId] = result
    const oldState = this._lightStates[entityId]
    if (!oldState) {
      this._log.error(`light with entity id = ${entityId} not found in _lightStates object`)
      return
    }
    const newState = new LightState(hassState.state as LightStateEnum, hassState.attributes.brightness)
    if (hassState.state != 'on') newState.brightness = oldState.brightness
    if (!oldState.isEqual(newState)) {
      this._log.verbose(`state of ${entityId} changed to ${newState.toString()}`)
      this.sendMessage(new LightStateUpdate(this.id, entityId, newState))
      this._lightStates[entityId] = newState
    }
  }

  get debugInfo(): object {
    //TODO!!! alle light states doorgeven
    return { lightStates: this._lightStates }
  }
}

/*
light.slaapkamer_4 on {"effect_list":["None","candle"],"supported_color_modes":["brightness"],"color_mode":"brightness","brightness":141,"effect":"None","mode":"normal","dynamics":"none","friendly_name":"Slaapkamer 4","supported_features":44}
light.slpk_4 on {"supported_color_modes":["brightness"],"color_mode":"brightness","brightness":141,"is_hue_group":true,"hue_scenes":[],"hue_type":"room","lights":["Slaapkamer 4"],"dynamics":false,"icon":"mdi:lightbulb-group","friendly_name":"Slpk 4","supported_features":40}
[Nest] 21440  - 12/02/2024 12:06:41 VERBOSE [Home Assistant Lights] state of slaapkamer4 changed to ON (bri 141)
[Nest] 21440  - 12/02/2024 12:06:41     LOG [MessagePrinter] LightStateUpdate -> Light "slaapkamer4" changed to ON (bri 141)
light.slaapkamer_4 off {"effect_list":["None","candle"],"supported_color_modes":["brightness"],"color_mode":null,"brightness":null,"effect":null,"mode":"normal","dynamics":"none","friendly_name":"Slaapkamer 4","supported_features":44}
light.slpk_4 off {"supported_color_modes":["brightness"],"color_mode":null,"brightness":null,"is_hue_group":true,"hue_scenes":[],"hue_type":"room","lights":["Slaapkamer 4"],"dynamics":false,"icon":"mdi:lightbulb-group","friendly_name":"Slpk 4","supported_features":40}
*/
