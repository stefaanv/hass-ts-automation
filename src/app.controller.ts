import { Controller, Get, Param } from '@nestjs/common'
import { AppService } from './app.service'
import { StateRepoService } from './architecture/state-repo.service'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly stateRepo: StateRepoService,
    private readonly _eventEmitter: EventEmitter2,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('states')
  getCurrentStates() {
    return this.stateRepo.currentStates
  }

  @Get('light/:state/:entity')
  setLightState(@Param('state') state: string, @Param('entity') entity: string) {
    this._eventEmitter.emit(`command.light`, {
      entity,
      onOff: state,
    })
    return 'OK'
  }
}
