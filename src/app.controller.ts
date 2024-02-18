import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { AppService } from './app.service'
// import { StateRepoService } from './infrastructure/state-repo.service.ts.disabled'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Message } from './infrastructure/messages/message.model'

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

  @Get('config')
  configInfo() {
    return this.appService.configInfo()
  }

  @Post('message/:entityId')
  sendMessage(@Param('entityId') entityId: string, @Body() body: Message) {
    this.appService.sendMessage(entityId, body)
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
