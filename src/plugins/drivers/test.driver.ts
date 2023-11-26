import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Driver, IDriver } from '@src/architecture/driver.model'
import { SensorStateUpdateEvent } from '@src/architecture/sensor.model'
import EventEmitter2 from 'eventemitter2'

export default class TestDriver extends Driver {
  name = 'Test Driver'
  version = '0.0.1'
  id = 'test'
  constructor(filenameRoot: string, localConfig: any, globalConfig: ConfigService) {
    super(filenameRoot, localConfig, globalConfig)
    this._logger = new Logger(this.name)
  }

  async start(emitter: EventEmitter2) {
    emitter.onAny((event, value) => {
      this.logDebug(`TestDriver : ${event} => ${JSON.stringify(value)}`)
    })
    const payload: SensorStateUpdateEvent = {
      originatingDriver: this.id,
      entity: 'test',
      nativeEntity: 'test',
      history: [],
      lastStateChange: new Date(),
      state: 'test',
      numberState: undefined,
      unit: '',
    }

    setInterval(() => emitter.emit('sensor.state', payload), 5000)
    return true
  }
  async stop() {
    console.log()
  }

  entityFrom(nativeMessage: any): string | undefined {
    return 'test'
  }
}
