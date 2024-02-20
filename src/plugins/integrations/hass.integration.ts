import { ConfigService } from '@nestjs/config'
import { IntegrationBase } from '@src/infrastructure/loadable-base-classes/integration.base'
import { EventEmitter2 } from '@nestjs/event-emitter'
import {
  createConnection,
  Connection,
  createLongLivedTokenAuth,
  getServices,
  HassServices,
} from 'home-assistant-js-websocket'
import { LightConfig } from './hass/light.config'
import {
  LightState,
  LightStateEnum,
  LightStateUpdate,
} from '@src/infrastructure/messages/state-updates/light-state-update.model'
import { mapValues } from '@bruyland/utilities'
import { CommandMessage, Message } from '@src/infrastructure/messages/message.model'
import { ToggleLightCommand } from '@src/infrastructure/messages/commands/toggle-light.model'
import { HassEventType, HassState } from '@src/infrastructure/messages/hass-event.model'

const wnd = globalThis
wnd.WebSocket = require('ws')

interface HassLightState {
  brightness: number
}

interface ToPrintDefinition {
  /** print all entities of domain*/ domain: string
  /** except those starting with. start with `!` on full entityId to print anyway */
  except: string[]
  disregardExcept: string[]
}

const ID = 'hass'
export default class HassIntegration extends IntegrationBase {
  public name = 'Home Assistant websocket'
  public version = '0.0.1'
  public id = ID

  private _hassConnection?: Connection = undefined
  private _hassUrl: string
  private _hassToken: string
  private readonly _printDomains: string[] = []
  private readonly _lightConfig: Record</** internal entity name */ string, LightConfig>
  private readonly _lightStates: Record</** hass entity name */ string, LightState> = {}
  private readonly _lightStatePollingInterval: number
  private readonly _toPrint: ToPrintDefinition[]

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
    this._printDomains = this.getConfig<string[]>('printDomains', [])
    this._lightStates = mapValues(this._lightConfig, (v, k) => new LightState())
    this._toPrint = this.getConfig<ToPrintDefinition[]>('toPrint', [])
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
        this._log.log(`toggling "${message.entityId}" (from ${message.origin})`)
        this.toggleLight(message.entityId)
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
    const tuple = Object.entries(this._lightConfig).find(
      ([, cfg]) => cfg.hassEntityId === hassEntityId,
    )
    if (tuple) return tuple[0]
    return undefined
  }

  private print(entityId: string): boolean {
    // if (entityId.startsWith('light')) debugger
    const domain = entityId.split('.')?.[0]
    const printDef = this._toPrint.find(pd => pd.domain === domain)
    if (!printDef) return false
    const rest = entityId.split('.').slice(1).join('.')
    if (printDef.disregardExcept?.some(k => rest.startsWith(k))) return true
    return !printDef.except?.some(k => rest.startsWith(k)) ?? true
  }

  private hassStateChangeHandler(e: HassEventType) {
    try {
      if (Object.keys(e.data).length === 0) {
        // e.data is soms een leeg object !
        return
      }

      // print info to console
      const entityId = e.data?.entity_id
      if (!entityId) return
      if (this.print(entityId)) {
        console.log(entityId, e.data.new_state.state, JSON.stringify(e.data.new_state.attributes))
      }

      if (entityId.startsWith('light')) {
        // capture light state changes
        this.handleLightStateChange(entityId, e.data.new_state)
        return
      }
    } catch (error) {
      console.error(`Error in hass.integration.ts > connection.subscribeEvents()`)
      console.log(error)
      // console.error('e =', e)
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
    const hassLightState = hassState.attributes as HassLightState
    const newState = new LightState(hassState.state as LightStateEnum, hassLightState.brightness)
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
