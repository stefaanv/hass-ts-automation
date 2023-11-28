export default {
  id: 'hass',
  hassWsUrl: 'ws://192.168.0.3:8123/api/websocket',
  accessToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjMTBmMmM1ODE3OWE0MjUwODIwYzM1NTgxNTBiYzlkZCIsImlhdCI6MTcwMDQxNjU5OCwiZXhwIjoyMDE1Nzc2NTk4fQ.Ob6c0s1n-7OBq5W3iyw9cuGciCq9KORk7IoNEFS8Bmg',
  sendAllMessages: false,
  incomingEntities: {
    motionDetectors: [
      { 'binary_sensor.presence_6': 'presence_keuken' },
      { 'binary_sensor.presence_9': 'presence_eethoek' },
      { 'binary_sensor.presence_14': 'presence_bureau' },
      { 'binary_sensor.presence_20': 'presence_buiten_achter' },
    ],
    doorContacts: [
      { 'binary_sensor.openclose_19': 'test_deurcontact' },
      { 'binary_sensor.deur_badkamer': 'deur_badkamer' },
    ],
    lights: [
      { 'light.achterdeur': 'achterdeur' },
      { 'light.bureau': 'bureau' },
      { 'light.keuken_2': 'keuken' },
      { 'light.eethoek_living': 'eethoek' },
      { 'light.zithoek': 'zithoek' },
      { 'light.buiten': 'gevel_tuin' },
      { 'light.slpk_4': 'slaapkamer_4' },
      { 'light.slaapkamer_pauline': 'slaapkamer_3' },
    ],
    lightLevel: [
      { 'sensor.lightlevel_10': 'eethoek' }, // motion sensor
      { 'sensor.lightlevel_21': 'tuin' }, // motion sensor onder zonnescherm schuifdeur
      { 'sensor.lightlevel_15': 'bureau' }, // motion sensor onder zonnescherm schuifdeur
      { 'sensor.lightlevel_23': 'badkamer' }, // afzonderlijke sensor
      { 'sensor.lightlevel_22': 'onbekend_22' }, // afzonderlijke sensor
      { 'sensor.lightlevel_4': 'onbekend_4' }, //
      { 'sensor.lightlevel_18': 'onbekend_18' }, // afzonderlijke sensor
      { 'sensor.lightlevel_26': 'onbekend_26' }, // motion sensor !
    ],
  },
  commands: {
    light: [
      { achterdeur: 'light.achterdeur' },
      { bureau: 'light.bureau' },
      { keuken: 'light.keuken_2' },
      { eethoek: 'light.eethoek_living' },
      { zithoek: 'light.zithoek' },
      { gevel_tuin: 'light.buiten' },
      { slaapkamer_4: 'light.slpk_4' },
      { slaapkamer_3: 'light.slaapkamer_pauline' },
    ],
  },
}
