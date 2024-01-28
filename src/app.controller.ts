import { Controller, Get, Param } from '@nestjs/common'
import { AppService } from './app.service'
// import { StateRepoService } from './architecture/state-repo.service.ts.disabled'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // private readonly stateRepo: StateRepoService,
    private readonly _eventEmitter: EventEmitter2,
  ) {}

  @Get('debug')
  debugInfo() {
    return this.appService.debugInfo()
  }

  // @Get('states')
  // getCurrentStates() {
  //   return this.stateRepo.currentStates
  // }

  // @Get('light/:state/:entity')
  // setLightState(@Param('state') state: string, @Param('entity') entity: string) {
  //   let onOff = state
  //   if (state === 'toggle') {
  //     const currentState = this.stateRepo.currentState(entity)
  //     onOff = currentState && 'state' in currentState && currentState?.state === 'on' ? 'off' : 'on'
  //   }
  //   this._eventEmitter.emit(`command.light`, { entity, onOff })
  //   return onOff
  // }
}
