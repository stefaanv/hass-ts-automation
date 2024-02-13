export default {
  baseUrl: 'http://homeassistant.local:8123/api',
  authToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI0YjFmY2EyOWU5ZWU0NTJiYmRiNTY4MjNkZjJhNWRkNCIsImlhdCI6MTY5NTc1MDk2MSwiZXhwIjoyMDExMTEwOTYxfQ.YUn0PYL8xc2kpE9yGI1N2NK9SGkkAVEFm1mf9QT5DI8',
  statePollingInterval: 2000,
  printCategories: [],
  lights: {
    slaapkamer4: { hassEntityId: 'slaapkamer_4', maxBrightness: 255 },
  },
}
