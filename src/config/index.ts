import { resolve } from 'path'

export default () => ({
  port: 3001,
  driverFolder: resolve(__dirname, '..', 'plugins', 'drivers'),
  driverExtension: '.driver.js',
  configExtension: '.config.js',
  keepSensorHistory: 10,
  integrations: {
    dummy: {
      test: 'my test config string',
      entities: ['entity-one', 'entity-two'],
    },
    hass: {
      hassWsUrl: 'ws://192.168.0.3:8123/api/websocket',
    },
  },
  stateRepo: {
    keepMaxNumber: 10,
    keepMinNumber: 3,
    keepMaxMinutes: 10,
  },
})
