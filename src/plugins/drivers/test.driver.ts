import { ConfigService } from '@nestjs/config'
import { Driver } from '@src/architecture/driver.model'
import EventEmitter2 from 'eventemitter2'

export default class TestDriver implements Driver {
  name = 'Test Driver'
  version = '0.0.1'
  start(localConfig: unknown, globalConfig: ConfigService, emitter: EventEmitter2) {
    emitter.onAny((event, value) => {
      console.log(`TestDriver : ${event} => ${JSON.stringify(value)}`)
    })
    setInterval(() => emitter.emit('testEvent', { test: 'data' }), 2000)
  }
  stop() {
    console.log()
  }
}
