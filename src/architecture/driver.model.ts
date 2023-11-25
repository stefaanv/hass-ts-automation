import { z } from 'zod'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ConfigService } from '@nestjs/config'
import { Logger, LoggerService } from '@nestjs/common'

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
  version: string
  start: (emitter: EventEmitter2) => Promise<boolean>
  stop: () => Promise<void>
}

export abstract class Driver implements IDriver {
  private _logger: LoggerService
  constructor(
    private readonly localConfig: any,
    private readonly globalConfig: ConfigService,
  ) {
    this._logger = new Logger(this.name)
  }
  name: string
  version: string
  abstract start: (emitter: EventEmitter2) => Promise<boolean>
  abstract stop: () => Promise<void>

  public debug: boolean = false
  private logDebug(message: any, ...optionalParams: any[]) {
    if (this.debug) this._logger.debug!(message, ...optionalParams)
  }
}
