import { resolve } from 'path'

export default () => ({
  port: 3001,
  driverFolder: resolve(__dirname, '..', 'plugins', 'drivers'),
  driverExtension: '.integration.js',
  configExtension: '.config.js',
  keepSensorHistory: 10,
  integrations: {
    dummy: {
      test: 'my test config string',
      entities: ['entity-one', 'entity-two'],
    },
    hass: {
      baseUrl: process.env.HASS_BASE_URL,
      authToken: process.env.HASS_AUTH_TOKEN,
    },
  },
  stateRepo: {
    keepMaxNumber: 10,
    keepMinNumber: 3,
    keepMaxMinutes: 10,
  },
})
