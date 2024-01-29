import { z } from 'zod'
import { ConfigService } from '@nestjs/config'
import { Logger, LoggerService } from '@nestjs/common'
import { get } from '@bruyland/utilities'
import { EventEmitter2 } from '@nestjs/event-emitter'

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
    /** eventEmitter */
    z.instanceof(EventEmitter2),
    /** driver-specific configuration */
    z.any(),
    /** Global configuration */
    z.instanceof(ConfigService),
  )
  .returns(LoadableSchema)

export type ILoadable = z.infer<typeof LoadableSchema>

//TODO: implementatie proberen op te halen met zod-class
// https://www.npmjs.com/package/zod-class

/** Base class for both integrations and automation scripts */
export abstract class Loadable implements ILoadable {
  public abstract name: string
  public abstract version: string
  public abstract id: string
  protected abstract get globalConfigKeyChain(): string[]
  abstract start(): Promise<boolean>
  abstract stop(): Promise<void>

  constructor(
    protected _eventEmitter: EventEmitter2,
    private readonly _localConfig: any, // content of the config file with the same name as the driver file
    private readonly _globalConfig: ConfigService,
  ) {}

  public debug: boolean = false

  protected getConfig<T>(key: string): T | undefined
  protected getConfig<T>(key: string, dflt: T): T
  protected getConfig<T>(key: string, dflt?: T) {
    const local = get<T>(this._localConfig, key)
    if (local !== undefined) return local
    const keyChain = [...this.globalConfigKeyChain, key].join('.')
    return dflt === undefined
      ? this._globalConfig.get<T>(keyChain)
      : this._globalConfig.get<T>(keyChain, dflt)
  }
}
