import { PlcClusterConfig, PlcConfig } from './wago/plc.config.model'

export default {
  addressStart: 20,
  shortPressTime: 350, //ms
  plcs: [
    {
      name: 'liftkoker',
      ip: '192.168.0.52',
      cobId: 31415,
      switches: {
        0: 'slaapkamer4',
        1: 'eethoek',
        2: 'zithoek',
        3: 'bureau',
        4: 'test',
        5: 'rl_beneden_op',
        6: 'rl_beneden_neer',
        7: 'slaapkamer3',
      },
    } as PlcConfig,
    {
      name: 'garage',
      ip: '192.168.0.51',
      cobId: 27182,
      switches: { 0: 'keuken' },
    } as PlcConfig,
  ],
} as PlcClusterConfig
