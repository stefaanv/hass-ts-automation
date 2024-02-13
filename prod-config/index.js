'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const { resolve } = require('path')
exports.default = () => ({
  port: 3001,
  integrationsFolder: resolve(__dirname, '..', 'plugins', 'integrations'),
  integrationExtension: '.integration.js',
  automationsFolder: resolve(__dirname, '..', 'plugins', 'automations'),
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
        slaapkamer4: { hassEntityId: 'slaapkamer_4', maxBrightness: 255 },
      },
    },
  },
  stateRepo: {
    keepMaxNumber: 10,
    keepMinNumber: 3,
    keepMaxMinutes: 10,
  },
})
//# sourceMappingURL=index.js.map
