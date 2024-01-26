export type PlcConfig = {
  name: string
  cobId: number
  ip: string
  switches: Record<number, string>
}

export type PlcClusterConfig = {
  addressStart: number
  shortPressTime: number
  plcs: PlcConfig[]
}
