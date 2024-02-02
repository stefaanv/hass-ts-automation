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
  },
  automations: {
    programFolder: resolve(pluginsFolder, 'automations'),
    configFolder: mainConfigFolder,
    extension: '.automation.js',
  },
  configExtension: '.config.js',
  keepSensorHistory: 10,
  integrationsConfig: {
    dummy: {
      test: 'my test config string',
      entities: ['entity-one', 'entity-two'],
    },
    'hass-lights': {
      baseUrl: 'http://homeassistant.local:8123/api',
      authToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI0YjFmY2EyOWU5ZWU0NTJiYmRiNTY4MjNkZjJhNWRkNCIsImlhdCI6MTY5NTc1MDk2MSwiZXhwIjoyMDExMTEwOTYxfQ.YUn0PYL8xc2kpE9yGI1N2NK9SGkkAVEFm1mf9QT5DI8',
      statePollingInterval: 2000,
      lights: {
        slaapkamer4: { hassEntityName: 'slaapkamer_4', maxBrightness: 255 },
      },
    },
  },
  stateRepo: {
    keepMaxNumber: 10,
    keepMinNumber: 3,
    keepMaxMinutes: 10,
  },
})
