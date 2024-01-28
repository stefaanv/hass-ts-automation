import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IntegrationBase } from '@src/architecture/integration.base'
import { Entity } from '@src/architecture/entities/entity.model'

export default class DummyIntegration extends IntegrationBase {
  public name = 'Dummy'
  public version = '0.0.1'
  public id = 'dummy'

  constructor(
    _driverFileName: string, // first part of the filename of the driver
    localConfig: any, // content of the config file with the same name as the driver file
    globalConfig: ConfigService,
  ) {
    super(localConfig, globalConfig)
    this._log = new Logger(DummyIntegration.name)
    const testConfig = this.getConfig('test')
    this.entities = this.getConfig<string[]>('entities', []).map(
      en => new Entity({ name: en, type: 'dummy' }),
    )
  }

  override async start(): Promise<boolean> {
    return super.reportStarted()
  }

  override async stop() {
    super.reportStopped()
  }

  get debugInfo(): object {
    return { info: 'no debug info from dummy driver' }
  }
}
