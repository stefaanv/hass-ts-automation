import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ConfigModule } from '@nestjs/config'
import configuration from '@src/config'
import { AutomationService } from './architecture/automation.service'
import { DriverLoader } from './architecture/driver-loader.service'

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AutomationService, DriverLoader],
})
export class AppModule {}
