export default {
  'single-button-on-off': [{ switch: 'sw-bureau-deur-B1', light: 'slaapkamer4' }],
}

/*
light.slaapkamer_4 on {"effect_list":["None","candle"],"supported_color_modes":["brightness"],"color_mode":"brightness","brightness":255,"effect":"None","mode":"normal","dynamics":"none","friendly_name":"Slaapkamer 4","supported_features":44}
[Nest] 10244  - 07/02/2024 11:51:08 VERBOSE [Home Assistant Lights] state of slaapkamer4 changed to ON (bri 255)
[Nest] 10244  - 07/02/2024 11:51:08     LOG [MessagePrinter] LightStateUpdate -> Light "slaapkamer4" changed to ON (bri 255)
light.slpk_4 on {"supported_color_modes":["brightness"],"color_mode":"brightness","brightness":255,"is_hue_group":true,"hue_scenes":[],"hue_type":"room","lights":["Slaapkamer 4"],"dynamics":false,"icon":"mdi:lightbulb-group","friendly_name":"Slpk 4","supported_features":40}
*/
const hue1 = {
  effect_list: ['None', 'candle'],
  supported_color_modes: ['brightness'],
  color_mode: 'brightness',
  brightness: 255,
  effect: 'None',
  mode: 'normal',
  dynamics: 'none',
  friendly_name: 'Slaapkamer 4',
  supported_features: 44,
}
const hue2 = {
  supported_color_modes: ['brightness'],
  color_mode: 'brightness',
  brightness: 255,
  is_hue_group: true,
  hue_scenes: [],
  hue_type: 'room',
  lights: ['Slaapkamer 4'],
  dynamics: false,
  icon: 'mdi:lightbulb-group',
  friendly_name: 'Slpk 4',
  supported_features: 40,
}
