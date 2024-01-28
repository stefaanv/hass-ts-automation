# Developer notes
## General
Mobus kan niet gebruikt worden om button pushes van de PLCs te detecteren want Min scan interval is 5 seconden !

## Boodschap modellen
Alle boodschappen die over het platform uitgewisseld worden moeten overerven van `MessageBase`
```ts
class MessageBase {
  origin: string // origin driver name
  entity: string // (hass) entity name
  timestamp: Date // timestamp of message creation
  stateToString(): string // string representation of the message content (without timestamp, origin and entity)
}
```

## Integration infrastructuur


## Libraries
Event handling is gebaseerd op
[EventEmitter2](https://www.npmjs.com/package/eventemitter2), meer info op [Nest documentatie](https://docs.nestjs.com/techniques/events)