export default {
  id: 'hass',
  hassWsUrl: 'ws://192.168.0.3:8123/api/websocket',
  accessToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjMTBmMmM1ODE3OWE0MjUwODIwYzM1NTgxNTBiYzlkZCIsImlhdCI6MTcwMDQxNjU5OCwiZXhwIjoyMDE1Nzc2NTk4fQ.Ob6c0s1n-7OBq5W3iyw9cuGciCq9KORk7IoNEFS8Bmg',
  // blockFilters: ['^sensor.energy', '^sensor.voltage', '^sensor.power', '^sensor.current', '^media_player'],
  blockFilters: [/phase_1$/i, /^media_player/, /^light\..*\_[1-9]/],
  throttleFilter: [/^sensor.energy/, /^sensor.voltage/, /^sensor.power/, /^sensor.current/],
  //'^sensor.gw2000a||^sensor.current|^media_player|^sensor.inverter_pv|^sensor.slimmelezer',
  // bulkRename: { regex: /(sensor).(?<entity>.*)$/, template: '{{entity}}' },
  entityTranslation: {
    power_consumed: 'actual-power-consumption',
    'binary_sensor.presence_6': 'presence_keuken',
    'binary_sensor.presence_9': 'presence_living_eethoek',
  },
}
