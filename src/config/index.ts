import { resolve } from 'path'

export default () => ({
  port: 3001,
  driverFolder: resolve(__dirname, '..', 'plugins', 'drivers'),
  driverExtension: '.driver.js',
  configExtension: '.config.js',
  keepSensorHistory: 10,
  drivers: {
    hass: {
      hassWsUrl: 'ws://192.168.0.3:8123/api/websocket',
    },
  },
})
