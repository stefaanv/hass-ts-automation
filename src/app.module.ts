import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ConfigModule } from '@nestjs/config'
import configuration from '@src/config'
import { AutomationLoader } from './infrastructure/loaders/automation-loader.service'
import { IntegrationLoader } from './infrastructure/loaders/integration-loader.service'
// import { StateRepoService } from './infrastructure/state-repo.service.ts.disabled'

//TODO standaard events in ander kleur afdrukken !
//TODO ook gekende messages met toString afdrukken

@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: true, delimiter: '.' }),
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AutomationLoader, IntegrationLoader /*StateRepoService*/],
})
export class AppModule {}
