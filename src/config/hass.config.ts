export default {
  baseUrl: process.env.HASS_BASE_URL,
  authToken: process.env.HASS_AUTH_TOKEN,
  user: 'js-automations',
  statePollingInterval: 2000,
  printCategories: ['light'],
  lights: {
    slaapkamer4: { hassEntityId: 'light.slaapkamer_4', maxBrightness: 255 },
  },
}
