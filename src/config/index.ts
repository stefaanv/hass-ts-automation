import { resolve } from 'path'

export default () => ({
  port: 3001,
  integrationsfolder: resolve(__dirname, '..', 'plugins', 'integrations'),
  integrationExtension: '.integration.js',
  automationsfolder: resolve(__dirname, '..', 'plugins', 'automations'),
  automationExtension: '.automation.js',
  configExtension: '.config.js',
  keepSensorHistory: 10,
  integrations: {
    dummy: {
      test: 'my test config string',
      entities: ['entity-one', 'entity-two'],
    },
    'hass-lights': {
      baseUrl: process.env.HASS_BASE_URL,
      authToken: process.env.HASS_AUTH_TOKEN,
      statePollingInterval: 2000,
      lights: {
        test: { hassEntityName: 'slaapkamer_4', maxBrightness: 255 },
      },
    },
  },
  stateRepo: {
    keepMaxNumber: 10,
    keepMinNumber: 3,
    keepMaxMinutes: 10,
  },
})
