import { z } from 'zod'
import { EventEmitter2 } from '@nestjs/event-emitter'

export const DriverSchema = z.object({
  name: z.string(),
  version: z.string(),
  start: z
    .function()
    .args(
      /** driver-specific configuration */
      z.unknown(),
      /** Global configuration */
      z.instanceof(EventEmitter2),
      /** For communication */
      z.instanceof(EventEmitter2),
    )
    .returns(z.void()),
  stop: z.function().args().returns(z.void()),
})

export type Driver = z.infer<typeof DriverSchema>
