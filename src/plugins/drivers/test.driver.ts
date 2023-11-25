import { ConfigService } from '@nestjs/config'
import { Driver, IDriver } from '@src/architecture/driver.model'
import EventEmitter2 from 'eventemitter2'

export default class TestDriver extends Driver {
  name = 'Test Driver'
  version = '0.0.1'
  constructor(localConfig: any, globalConfig: ConfigService) {
    super(localConfig, globalConfig)
  }

  async start(emitter: EventEmitter2) {
    emitter.onAny((event, value) => {
      this.logDebug(`TestDriver : ${event} => ${JSON.stringify(value)}`)
    })
    setInterval(() => emitter.emit('testEvent', { test: 'data' }), 2000)
    return true
  }
  async stop() {
    console.log()
  }
}
