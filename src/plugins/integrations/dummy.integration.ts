import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IntegrationBase } from '@src/infrastructure/loadable-base-classes/integration.base'
import { Entity } from '@infrastructure/entities/entity.model'
import { EventEmitter2 } from '@nestjs/event-emitter'

export default class DummyIntegration extends IntegrationBase {
  public name = 'Dummy'
  public version = '0.0.1'
  public id = 'dummy'

  constructor(
    _integrationFileName: string, // first part of the filename of the driver
    eventEmitter: EventEmitter2,
    localConfig: any, // content of the config file with the same name as the driver file
    globalConfig: ConfigService,
  ) {
    super(eventEmitter, localConfig, globalConfig)
    this._log = new Logger(DummyIntegration.name)
    const testConfig = this.getConfig('test')
    this.entities = this.getConfig<string[]>('entities', []).map(
      en => new Entity({ name: en, type: 'dummy' }),
    )
  }

  override async start(): Promise<boolean> {
    return true
  }

  override async stop() {}

  get debugInfo(): object {
    return { info: 'no debug info from dummy driver' }
  }
}
