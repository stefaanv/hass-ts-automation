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
      printDomains: ['sensor'],
      // will not print updates of entityIds starting with ...
      // toPrintIds: ['sensor.battery_charge_discharge_power'],
      toPrintDefs: [
        // {
        //   domain: 'sensor',
        //   except: ['current', 'power', 'voltage', 'gw2000a', 'battery', 'inverter'],
        // },
        // { domain: 'light' },
      ],
      receptionFilterIds: [
        'binary_sensor.openclose_19',
        'sensor.battery_charge_discharge_power',
        'sensor.slimmelezer_uptime',
      ],
      receptionFilterDefs: [{ domain: 'light' }],
      lights: {
        'light.slaapkamer_4': { hassEntityId: 'light.slaapkamer_4', maxBrightness: 255 },
        'light.bureau': { hassEntityId: 'light.bureau', maxBrightness: 255 },
        'light.zithoek': { hassEntityId: 'light.zithoek', maxBrightness: 255 },
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
  },
  automationsConfig: {
    'switch-lights': {
      'single-button-toggle': [{ switch: 'sw-bureau-deur-B1', lights: ['light.slaapkamer_4'] }],
    },
    'msg-logger': {
      logFile: '../data/all-messages.log',
      copyToConsole: true,
    },
  },

  stateRepo: {
    keepMaxNumber: 10,
    keepMinNumber: 3,
    keepMaxMinutes: 10,
  },
})
