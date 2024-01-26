import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DriverBase } from '@src/architecture/driver.base'
import { Entity } from '@src/architecture/entities/entity.model'
import { white } from 'ansi-colors'

export default class DummyDriver extends DriverBase {
  public name = 'Dummy'
  public version = '0.0.1'
  public id = 'dummy'

  constructor(
    driverFileName: string, // first part of the filename of the driver
    localConfig: any, // content of the config file with the same name as the driver file
    globalConfig: ConfigService,
  ) {
    super(localConfig, globalConfig)
    this._log = new Logger(DummyDriver.name)
    const testConfig = this.getConfig('test')
    this.entities = this.getConfig<string[]>('entities', []).map(
      en => new Entity({ name: en, type: 'dummy' }),
    )

    // this._logger.debug!(`test config = "${testConfig}"`)
  }

  override async start(): Promise<boolean> {
    return super.reportStarted()
  }

  override async stop() {
    super.reportStopped()
  }
}
