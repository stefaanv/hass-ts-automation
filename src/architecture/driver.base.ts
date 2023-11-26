import { z } from 'zod'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ConfigService } from '@nestjs/config'
import { Logger, LoggerService } from '@nestjs/common'
import { construct, crush, get } from 'radash'
import { MultiRegex } from '@src/utilities'
import { KnownMessage } from './known-messages/sensor.model'

const GOBAL_CONFIG_PREFIX = 'drivers'

export const DriverSchema = z.object({
  name: z.string(),
  version: z.string(),
  start: z.function().args().returns(z.promise(z.boolean())),
  stop: z.function().args().returns(z.void()),
})

export const DriverConstructorSchema = z
  .function()
  .args(
    /** filename root */
    z.string(),
    /** driver-specific configuration */
    z.any(),
    /** Global configuration */
    z.instanceof(ConfigService),
  )
  .returns(z.string()) //DriverSchema)

//TODO: minimum variatie filter maken (realtief & absoluut)
// bvb aan-en af zetten van debug logging
export interface IDriver {
  name: string
  id: string
  version: string
  start: () => Promise<boolean>
  stop: () => Promise<void>
}

export abstract class DriverBase implements IDriver {
  protected _logger: LoggerService
  protected _config: any
  protected _blockFilters: MultiRegex
  protected _selectFilters: MultiRegex
  protected _entityTranslation: Record<string, string>
  static eventEmitter: EventEmitter2

  constructor(filenameRoot: string, localConfig: any, globalConfig: ConfigService) {
    this.id = localConfig.id ?? filenameRoot
    const globalKey = [GOBAL_CONFIG_PREFIX, this.id].join('.')
    this._config = construct({ ...crush(globalConfig.get<any>(globalKey)), ...crush(localConfig) })
    this._logger = new Logger(`${this.id} driver`)
    this._logger.log(`${this.name} (${this.id})${this.version ? ' v' + this.version : ''} loaded`)
    this._blockFilters = new MultiRegex(this.getConfig('blockFilters', []))
    this._selectFilters = new MultiRegex(this.getConfig('selectFilters', []), true)
    this._entityTranslation = this.getConfig('entityTranslation', {})
  }
  public readonly name: string
  public readonly version: string
  public readonly id: string

  abstract start(): Promise<boolean>
  abstract stop(): Promise<void>
  abstract entityFrom(nativeMessage: any): string | undefined
  abstract transformKnownMessage(entity: string, nativeMessage: any): KnownMessage

  filter(entity: string): boolean {
    if (this._blockFilters.test(entity)) return false
    return this._selectFilters.test(entity)
  }

  translateEntityName(entity: string | undefined): string | undefined {
    if (entity === undefined) return undefined
    return this._entityTranslation[entity] ?? entity
  }

  handleIncomingMessage(nativeMessage: any) {
    const entity = this.translateEntityName(this.entityFrom(nativeMessage))
    if (!entity || this._blockFilters.test(entity) || !this._selectFilters.test(entity)) {
      // if (entity) this.logDebug(`message from ${entity} filtered away`)
      return
    }
    const knownMsg = this.transformKnownMessage(entity, nativeMessage)
    const msg = knownMsg ?? nativeMessage
    const content = knownMsg
      ? `${knownMsg.numberState ?? knownMsg.state} ${knownMsg.unit}`
      : JSON.stringify(nativeMessage).slice(0, 100)
    console.log(`${entity} -> ${content}`) //TODO vervangen door debugLog
    DriverBase.eventEmitter.emit('sensor.state', msg)

    // this._eventEmitter.emit(`${this.id}.${entity}`, payload)
  }

  public debug: boolean = false
  protected logDebug(message: any, ...optionalParams: any[]) {
    if (this.debug) this._logger.debug!(message, ...optionalParams)
  }

  protected getConfig<T>(key: string): T | undefined
  protected getConfig<T>(key: string, dflt: T): T
  protected getConfig<T>(key: string, dflt?: T) {
    return get<T>(this._config, key) ?? dflt
  }
}
