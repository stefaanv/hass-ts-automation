import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ConsoleLogger, Logger } from '@nestjs/common'
import { AutomationLoader } from './infrastructure/loaders/automation-loader.service'
import { IntegrationLoader } from './infrastructure/loaders/integration-loader.service'

/* TODO
- starten/stoppen/herladen van automatisaties en integraties
- op/neer van rolluik living
- eigenschappen van automation-loader en integration-loader naar super klasse verhuizen
- eigenschappen van autom. en integr. naar super klasse verhuizen
*/
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new ConsoleLogger() })
  const config = app.get(ConfigService)
  const port = config.get('port', 3000)
  await app.listen(port)
  const logger = new Logger('main')
  logger.log(`Application started, listening to port ${port}`)
  app.get(AutomationLoader).loadAll()
  app.get(IntegrationLoader).loadAll()
}
bootstrap()
