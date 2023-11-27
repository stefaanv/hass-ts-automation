import { z } from 'zod'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ConfigService } from '@nestjs/config'
import { Logger, LoggerService } from '@nestjs/common'
import { construct, crush, get } from 'radash'
import { MultiRegex, RegexTemplateReplace } from '@src/utilities'
import { Message } from './message.model'

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
  .returns(DriverSchema)

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
  private readonly bulkRename: RegexTemplateReplace

  constructor(filenameRoot: string, localConfig: any, globalConfig: ConfigService) {
    this.id = localConfig.id ?? filenameRoot
    const globalKey = [GOBAL_CONFIG_PREFIX, this.id].join('.')
    this._config = construct({ ...crush(globalConfig.get<any>(globalKey)), ...crush(localConfig) })
    this._logger = new Logger(`${this.id} driver`)
    this._logger.log(`${this.name} (${this.id})${this.version ? ' v' + this.version : ''} loaded`)
    this._blockFilters = new MultiRegex(this.getConfig('blockFilters', []))
    this._selectFilters = new MultiRegex(this.getConfig('selectFilters', []), true)
    this._entityTranslation = this.getConfig('entityTranslation', {})
    this.bulkRename = new RegexTemplateReplace(this.getConfig('bulkRename'))
  }
  public readonly name: string
  public readonly version: string
  public readonly id: string

  abstract start(): Promise<boolean>
  abstract stop(): Promise<void>

  filter(entity: string): boolean {
    if (this._blockFilters.test(entity)) return false
    return this._selectFilters.test(entity)
  }

  translateEntityName(entity: string | undefined): string | undefined {
    if (entity === undefined) return undefined
    const bulk = this.bulkRename.transform(entity)
    return this._entityTranslation[bulk] ?? bulk
  }

  handleIncomingMessage(message: Message) {
    // translate the entity name
    const trEntity = this.translateEntityName(message.entity)
    if (!trEntity || this._blockFilters.test(trEntity) || !this._selectFilters.test(trEntity)) return
    message.entity = trEntity

    // debug log and distribute
    console.log(message.toString()) //TODO vervangen door debugLog
    DriverBase.eventEmitter.emit(`driver.${this.id}`, message)
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
