'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const { resolve } = require('path')

exports.default = () => ({
  port: 3002,
  integrationsFolder: resolve(__dirname, '..', 'plugins', 'integrations'),
  integrationExtension: '.integration.js',
  automationsFolder: resolve(__dirname, '..', 'plugins', 'automations'),
  automationExtension: '.automation.js',
  configExtension: '.config.js',
  keepSensorHistory: 10,
  automations: {
    programFolder: resolve(__dirname, '..', 'plugins', 'automations'),
    configFolder: __dirname,
    extension: '.automation.js',
  },
  integrations: {
    programFolder: resolve(__dirname, '..', 'plugins', 'integrations'),
    configFolder: __dirname,
    extension: '.integration.js',
    // ignore: ['dummy.integration.js', 'hass-lights.integration.js'],
  },
  integrationsConfig: {
    hass: {
      baseUrl: 'http://homeassistant.local',
      authToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI0YjFmY2EyOWU5ZWU0NTJiYmRiNTY4MjNkZjJhNWRkNCIsImlhdCI6MTY5NTc1MDk2MSwiZXhwIjoyMDExMTEwOTYxfQ.YUn0PYL8xc2kpE9yGI1N2NK9SGkkAVEFm1mf9QT5DI8',
      user: 'js-automations',
      statePollingInterval: 2000,
      printCategories: ['light'],
      lights: {
        slaapkamer4: { hassEntityId: 'slaapkamer_4', maxBrightness: 255 },
      },
    },
    wago: {
      addressStart: 20,
      shortPressTime: 350,
      plcs: [
        {
          name: 'liftkoker',
          ip: '192.168.0.52',
          cobId: 31415,
          switches: {
            0: 'sw_slpk4_deur_A1',
            1: 'sw_eethoek',
            2: 'sw_zithoek',
            3: 'sw_bureau',
            4: 'sw_bureau_deur_A1',
            5: 'rl_beneden_op',
            6: 'rl_beneden_neer',
            7: 'sw_slpk3_deur_A1',
          },
        },
        {
          name: 'garage',
          ip: '192.168.0.51',
          cobId: 27182,
          switches: { 0: 'keuken' },
        },
      ],
    },
  },
  automationsConfig: {
    'switch-light': {
      'single-button-on-off': [{ switch: 'sw_slpk4_deur_A1', light: 'slaapkamer4' }],
    },
  },
  stateRepo: {
    keepMaxNumber: 10,
    keepMinNumber: 3,
    keepMaxMinutes: 10,
  },
})
//# sourceMappingURL=index.js.map
