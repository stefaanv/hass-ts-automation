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
      baseUrl: 'http://192.168.0.3:8123',
      authToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI0YjFmY2EyOWU5ZWU0NTJiYmRiNTY4MjNkZjJhNWRkNCIsImlhdCI6MTY5NTc1MDk2MSwiZXhwIjoyMDExMTEwOTYxfQ.YUn0PYL8xc2kpE9yGI1N2NK9SGkkAVEFm1mf9QT5DI8',
      user: 'js-automations',
      statePollingInterval: 2000,
      printCategories: ['light'],
      lights: {
        'light.slaapkamer_4': { hassEntityId: 'light.slaapkamer_4', maxBrightness: 255 },
        'light.bureau': { hassEntityId: 'light.bureau', maxBrightness: 255 },
        'light.keuken': { hassEntityId: 'light.keuken', maxBrightness: 255 },
        'light.zithoek': { hassEntityId: 'light.zithoek', maxBrightness: 255 },
        'light.eethoek': { hassEntityId: 'light.eethoek', maxBrightness: 255 },
        'light.slaapkamer_pauline': { hassEntityId: 'light.slaapkamer_pauline', maxBrightness: 255 },
        'light.sfeerlichten_achter': {
          hassEntityId: 'light.sfeerlichten_buiten_achter_groep',
          maxBrightness: 255,
        },
        'light.sfeerlichten_zuid': {
          hassEntityId: 'light.sfeerlichten_buiten_zuidr_groep',
          maxBrightness: 255,
        },
        'light.spot_achter': { hassEntityId: 'light.spot_achter', maxBrightness: 255 },
      },
    },
    'wago-nv': {
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
            8: 'sw_nv_gevel_achter',
            9: 'sw_nv_spot_achter',
          },
        },
        {
          name: 'garage',
          ip: '192.168.0.51',
          cobId: 27182,
          switches: { 0: 'sw_keuken' },
        },
      ],
    },
  },
  automationsConfig: {
    'switch-lights': {
      'single-button-toggle': [
        { switch: 'sw_slpk4_deur_A1', lights: ['light.slaapkamer_4'] },
        { switch: 'sw_keuken', lights: ['light.keuken'] },
        { switch: 'sw_zithoek', lights: ['light.zithoek'] },
        { switch: 'sw_eethoek', lights: ['light.eethoek'] },
        { switch: 'sw_bureau', lights: ['light.bureau'] },
        { switch: 'sw_slpk3_deur_A1', lights: ['light.slaapkamer_pauline'] },
        {
          switch: 'sw_nv_gevel_achter',
          lights: ['light.sfeerlichten_achter', 'light.sfeerlichten_zuid'],
        },
        { switch: 'sw_nv_spot_achter', lights: ['light.spot_achter'] },
      ],
    },
    'msg-logger': {
      logFile: 'all-messages.log',
    },
  },
  stateRepo: {
    keepMaxNumber: 10,
    keepMinNumber: 3,
    keepMaxMinutes: 10,
  },
})
//# sourceMappingURL=index.js.map
