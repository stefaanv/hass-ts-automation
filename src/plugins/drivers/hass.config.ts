export default {
  id: 'hass',
  hassWsUrl: 'ws://192.168.0.3:8123/api/websocket',
  accessToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjMTBmMmM1ODE3OWE0MjUwODIwYzM1NTgxNTBiYzlkZCIsImlhdCI6MTcwMDQxNjU5OCwiZXhwIjoyMDE1Nzc2NTk4fQ.Ob6c0s1n-7OBq5W3iyw9cuGciCq9KORk7IoNEFS8Bmg',
  blockFilters: ['^sensor.power|^sensor.current|^media_player'],
  //'^sensor.voltage|^sensor.energy|^sensor.gw2000a||^sensor.current|^media_player|^sensor.inverter_pv|^sensor.slimmelezer',
}
