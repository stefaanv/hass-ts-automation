import { resolve } from 'path'

export default () => ({
  port: 3001,
  driverFolder: resolve(__dirname, '..', 'plugins', 'drivers'),
  driverExtension: '.js',
})
