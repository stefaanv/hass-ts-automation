export const entityTypeValues = ['dummy', 'button', 'light'] as const
export type EntityType = (typeof entityTypeValues)[number]

export interface EntityConfigBase {
  name: string
  type: EntityType
}

export class Entity<TConfig extends EntityConfigBase = EntityConfigBase> {
  constructor(public config: TConfig) {}
  get name() {
    return this.config.name
  }
  get type() {
    return this.config.type
  }
  toString() {
    return `${this.name} (${this.type})`
  }
}
