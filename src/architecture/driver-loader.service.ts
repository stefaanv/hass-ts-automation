import { Injectable } from '@nestjs/common'
import { Driver, DriverSchema } from './driver.model'
import { tryit } from 'radash'
import { EventEmitter2 } from 'eventemitter2'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class DriverLoader {
  constructor(private readonly _config: ConfigService) {}

  async load() {
    const emitter = new EventEmitter2()
    const testDriverPath = '../plugins/drivers/test.driver'
    const driverClass = (await import(testDriverPath)).default
    const driverInstance: Driver = new driverClass()
    const [error, result] = tryit(DriverSchema.parse)(driverInstance)
    console.log(`Driver ${driverInstance.name} v${driverInstance.version} loaded`)
    // driverInstance.start(emitter)
    driverInstance.stop()
  }
}
