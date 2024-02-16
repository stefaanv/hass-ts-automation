import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { AutomationBase } from '@src/infrastructure/loadable-base-classes/automation.base'
import { Message } from '@infrastructure/messages/message.model'
import { ConfigService } from '@nestjs/config'
import { resolve } from 'path'
import { appendFileSync } from 'fs'
import { format } from 'date-fns'

const ID = 'msg-logger'
export default class MessageLogger extends AutomationBase {
  public name = 'Log all messages'
  public version = '0.0.1'
  public id = ID
  private readonly _logfile: string
  private logFileOK = true

  constructor(
    _automationFileName: string,
    eventEmitter: EventEmitter2,
    localConfig: any,
    globalConfig: ConfigService,
  ) {
    super(ID, eventEmitter, localConfig, globalConfig)
    this._logfile = resolve(__dirname, '../..', this.getConfig('logFile', 'messages.log'))
    // this._log.verbose(`logfile config = ${this.getConfig('logFile', '')}`)
    // this._log.verbose(`logfile = ${this._logfile}`)
  }

  async start(): Promise<boolean> {
    // does nothing
    return true
  }
  async stop(): Promise<void> {
    //does nothing
  }

  override handleInternalMessage(message: Message) {
    const date = format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS')
    const msg = message
      .toString()
      .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '') // remove colorization
    this.writeToLog(`${date} ${message.constructor.name} -> ${msg}\r\n`)
  }

  private writeToLog(msg: string) {
    if (this.logFileOK) {
      try {
        appendFileSync(this._logfile, msg)
      } catch (error) {
        this.logFileOK = false
        this._log.error(`unable to append file ${this._logfile}`)
        console.error(error)
      }
    }
  }

  get debugInfo() {
    return undefined
  }
  get configInfo() {
    return { active: true }
  }
}
