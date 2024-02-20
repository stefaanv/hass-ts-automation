import { z } from 'zod'
import { ConfigService } from '@nestjs/config'
import { get } from '@bruyland/utilities'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Message } from '../messages/message.model'
import { Logger } from '@nestjs/common'

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

//TODO filtering implementeren op de messages
/** Base class for both integrations and automation scripts */
export abstract class Loadable implements ILoadable {
  public abstract name: string
  public abstract version: string
  public abstract id: string
  protected _log: Logger
  abstract _generalConfigKey: string
  abstract _configConfigKey: string

  abstract start(): Promise<boolean>
  abstract stop(): Promise<void>

  constructor(
    id: string,
    protected _eventEmitter: EventEmitter2,
    private readonly _localConfig: any, // content of the config file with the same name as the driver file
    private readonly _globalConfig: ConfigService,
  ) {
    this._log = new Logger(id)
    this._eventEmitter.on('**', message => this.handleInternalMessage(message))
  }

  public debug: boolean = false
  abstract get debugInfo(): object | undefined
  abstract get configInfo(): object | undefined

  sendInternalMessage(message: Message) {
    this._eventEmitter.emit(message.entityId, message)
  }

  handleInternalMessage(message: Message): void {
    debugger
    this._log.verbose(`unhandled message from ${this.id}`)
  }

  protected get globalConfigKeyChain(): string[] {
    return [this._configConfigKey, this.id]
  }

  protected get globalGeneralConfigKeyChain(): string[] {
    return [this._generalConfigKey, this.id]
  }

  protected getConfig<T>(key: string): T | undefined
  protected getConfig<T>(key: string, dflt: T): T
  protected getConfig<T>(key: string, dflt?: T) {
    const local = get<T>(this._localConfig, key)
    if (local !== undefined && Object.keys(local).length > 0) return local
    const keyChain = [...this.globalConfigKeyChain, key].join('.')
    // const test = this._globalConfig.get<T>(keyChain)
    return dflt === undefined
      ? this._globalConfig.get<T>(keyChain)
      : this._globalConfig.get<T>(keyChain, dflt)
  }
}
