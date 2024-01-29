'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.default = {
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
}
