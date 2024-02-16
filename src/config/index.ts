import { resolve } from 'path'
const mainConfigFolder = resolve(__dirname)
const projectRoot = resolve(__dirname, '..')
const pluginsFolder = resolve(projectRoot, 'plugins')

export default () => ({
  port: 3000,
  folders: {
    mainConfigFolder,
    projectRoot,
    pluginsFolder,
  },
  integrations: {
    programFolder: resolve(pluginsFolder, 'integrations'),
    configFolder: mainConfigFolder,
    extension: '.integration.js',
    ignore: ['dummy.integration.js', 'hass-lights.integration.js'],
  },
  automations: {
    programFolder: resolve(pluginsFolder, 'automations'),
    configFolder: mainConfigFolder,
    extension: '.automation.js',
  },
  configExtension: '.config.js',
  keepSensorHistory: 10,
  integrationsConfig: {
    hass: {
      baseUrl: process.env.HASS_BASE_URL,
      authToken: process.env.HASS_AUTH_TOKEN,
      user: 'js-automations',
      statePollingInterval: 2000,
      printCategories: ['light'],
      lights: {
        'light.slaapkamer_4': { hassEntityId: 'light.slaapkamer_4', maxBrightness: 255 },
        'light.bureau': { hassEntityId: 'light.bureau', maxBrightness: 255 },
      },
    },
    'wago-nv': {
      addressStart: 20,
      shortPressTime: 350, //ms
      plcs: [
        {
          name: 'liftkoker',
          ip: '192.168.0.52',
          cobId: 42071,
          switches: {
            0: 'sw-bureau-deur-B1',
            1: 'sw-dummy',
          },
        },
      ],
    },
    //   dummy: {
    //     test: 'my test config string',
    //     entities: ['entity-one', 'entity-two'],
    //   },
    //   'hass-lights': {
    //     baseUrl: 'http://homeassistant.local:8123/api',
    //     authToken:
    //       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI0YjFmY2EyOWU5ZWU0NTJiYmRiNTY4MjNkZjJhNWRkNCIsImlhdCI6MTY5NTc1MDk2MSwiZXhwIjoyMDExMTEwOTYxfQ.YUn0PYL8xc2kpE9yGI1N2NK9SGkkAVEFm1mf9QT5DI8',
    //     statePollingInterval: 2000,
    //     lights: {
    //       slaapkamer4: { hassEntityId: 'slaapkamer_4', maxBrightness: 255 },
    //     },
    //   },
  },
  automationsConfig: {
    'switch-lights': {
      'single-button-on-off': [{ switch: 'sw-bureau-deur-B1', light: 'light.slaapkamer_4' }],
    },
    'msg-logger': {
      logFile: 'data/all-messages.log',
    },
  },

  stateRepo: {
    keepMaxNumber: 10,
    keepMinNumber: 3,
    keepMaxMinutes: 10,
  },
})
