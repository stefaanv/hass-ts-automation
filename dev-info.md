# Developer notes
## General
Mobus kan niet gebruikt worden om button pushes van de PLCs te detecteren want Min scan interval is 5 seconden !

## Libraries
Event handling is gebaseerd op
[EventEmitter2](https://www.npmjs.com/package/eventemitter2), meer info op [Nest documentatie](https://docs.nestjs.com/techniques/events)