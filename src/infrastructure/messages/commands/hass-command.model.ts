export interface HassCommand {
  domain: string
  command: string
  name: string
  fields: object
  target?: object
}

export interface HassTarget {
  entity: HassTargetEntity[]
}

export interface HassTargetEntity {
  domain?: string[]
  supported_features?: number[]
}
