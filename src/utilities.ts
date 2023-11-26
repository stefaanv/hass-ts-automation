import { render } from 'mustache'

export class MultiRegex {
  constructor(
    private readonly regexes: RegExp[],
    private readonly _emptyResult = false,
  ) {}
  test(value: string) {
    if (this.regexes.length === 0) return this._emptyResult
    return this.regexes.some(r => r.test(value))
  }
}

export class RegexTemplateReplace {
  constructor(private readonly definition?: { regex: RegExp; template: string }) {}
  transform(value: string) {
    if (this.definition === undefined) return value
    const object = value.match(this.definition.regex)?.groups
    const result = !object ? value : render(this.definition.template, object)
    return result
  }
}
