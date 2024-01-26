import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ConfigModule } from '@nestjs/config'
import configuration from '@src/config'
import { AutomationService } from './architecture/automation.service'
import { DriverLoader } from './architecture/driver-loader.service'
// import { StateRepoService } from './architecture/state-repo.service.ts.disabled'

//TODO standaard events in ander kleur afdrukken !
//TODO ook gekende messages met toString afdrukken

@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: true }),
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AutomationService, DriverLoader /*StateRepoService*/],
})
export class AppModule {}
