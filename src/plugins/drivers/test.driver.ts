import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DriverBase } from '@src/architecture/driver.base'
import { SensorStateUpdate } from '@src/architecture/known-messages/sensor.model'

export default class TestDriver extends DriverBase {
  name = 'Test Driver'
  version = '0.0.1'
  id = 'test'
  constructor(filenameRoot: string, localConfig: any, globalConfig: ConfigService) {
    super(filenameRoot, localConfig, globalConfig)
    this._logger = new Logger(this.name)
  }

  async start() {
    const payload: SensorStateUpdate = {
      originatingDriver: this.id,
      entity: 'test',
      nativeEntity: 'test',
      history: [],
      time: new Date(),
      state: 'test',
      numberState: undefined,
      unit: '',
    }

    // setInterval(() => this.handleIncomingMessage(payload), 10000)
    return true
  }
  async stop() {
    console.log()
  }

  entityFrom(nativeMessage: any): string | undefined {
    return nativeMessage.entity
  }
  transformKnownMessage(entity: string, nativeMessage: any) {
    return nativeMessage
  }
}
