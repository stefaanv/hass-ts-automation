import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ConsoleLogger, Logger } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new ConsoleLogger() })
  const config = app.get(ConfigService)
  const port = config.get('port', 3000)
  await app.listen(port)
  const logger = new Logger('main')
  logger.log(`Application started, listening to port ${port}`)
}
bootstrap()
