import { z } from 'zod'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ConfigService } from '@nestjs/config'
import { Logger, LoggerService } from '@nestjs/common'
import { construct, crush, get } from 'radash'
import { MultiRegex } from '@src/utilities'

const GOBAL_CONFIG_PREFIX = 'drivers'

export const DriverSchema = z.object({
  name: z.string(),
  version: z.string(),
  start: z
    .function()
    .args(
      /** For communication */
      z.instanceof(EventEmitter2),
    )
    .returns(z.void()),
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

//TODO: toch abstracte klasse van maken en gedeelde functies in steken
// bvb aan-en af zetten van debug logging
export interface IDriver {
  name: string
  id: string
  version: string
  start: (emitter: EventEmitter2) => Promise<boolean>
  stop: () => Promise<void>
}

export abstract class Driver implements IDriver {
  protected _logger: LoggerService
  protected _config: any
  protected _blockFilters: MultiRegex
  protected _selectFilters: MultiRegex
  protected _entityTranslation: Record<string, string>
  protected _eventEmitter: EventEmitter2

  constructor(filenameRoot: string, localConfig: any, globalConfig: ConfigService) {
    this.id = localConfig.id ?? filenameRoot
    const globalKey = [GOBAL_CONFIG_PREFIX, this.id].join('.')
    this._config = construct({ ...crush(globalConfig.get<any>(globalKey)), ...crush(localConfig) })
    this._logger = new Logger(`${this.id} driver`)
    this._logger.log(`${this.name} (${this.id})${this.version ? ' v' + this.version : ''} loaded`)
    this._blockFilters = new MultiRegex(this.getConfig('blockFilters', []))
    this._selectFilters = new MultiRegex(this.getConfig('selectFilters', []), true)
  }
  public readonly name: string
  public readonly version: string
  public readonly id: string

  abstract start(emitter: EventEmitter2): Promise<boolean>
  abstract stop(): Promise<void>
  abstract entityFrom(nativeMessage: any): string | undefined

  filter(entity: string): boolean {
    if (this._blockFilters.test(entity)) return false
    return this._selectFilters.test(entity)
  }

  handleIncomingFromDriver(nativeMessage: any) {
    const entity = this.entityFrom(nativeMessage)
    if (!entity || this._blockFilters.test(entity) || !this._selectFilters.test(entity)) {
      if (entity) this.logDebug(`message from ${entity} filtered away`)
      return
    }
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
