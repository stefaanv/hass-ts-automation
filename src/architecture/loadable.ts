import { z } from 'zod'
import { ConfigService } from '@nestjs/config'
import { Logger, LoggerService } from '@nestjs/common'
import { construct, crush, get } from 'radash'

export const LoadableSchema = z.object({
  name: z.string(),
  version: z.string(),
  start: z.function().args().returns(z.promise(z.boolean())),
  stop: z.function().args().returns(z.void()),
})

export const LoadableConstructorSchema = z
  .function()
  .args(
    /** filename root */
    z.string(),
    /** driver-specific configuration */
    z.any(),
    /** Global configuration */
    z.instanceof(ConfigService),
  )
  .returns(LoadableSchema)

export interface ILoadable {
  name: string
  id: string
  version: string
  start: () => Promise<boolean>
  stop: () => Promise<void>
}

export abstract class Loadable implements ILoadable {
  protected _logger: LoggerService
  protected _config: any

  constructor(filenameRoot: string, localConfig: any, globalConfig: ConfigService) {
    this.id = localConfig.id ?? filenameRoot
    this._config = construct({ ...crush(globalConfig.get<any>(globalKey)), ...crush(localConfig) })
    this._logger = new Logger(`${this.id} driver`)
    this._logger.log(`${this.name} (${this.id})${this.version ? ' v' + this.version : ''} loaded`)
  }
  public readonly name: string
  public readonly version: string
  public readonly id: string
  abstract start(): Promise<boolean>
  abstract stop(): Promise<void>

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
