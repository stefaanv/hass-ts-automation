import { PlcClusterConfig, PlcConfig } from './wago/plc.config.model'

export default {
  addressStart: 20,
  shortPressTime: 350, //ms
  plcs: [
    {
      name: 'liftkoker',
      ip: '192.168.0.52',
      cobId: 42071,
      switches: {
        0: 'sw-bureau-deur-B1',
      },
    } as PlcConfig,
    // {
    //   name: 'garage',
    //   ip: '192.168.0.51',
    //   cobId: 27182,
    //   switches: { 0: 'keuken' },
    // } as PlcConfig,
  ],
} as PlcClusterConfig
