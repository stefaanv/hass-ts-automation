export class MultiRegex {
  private readonly regexes: RegExp[]
  constructor(
    sources: string[],
    private readonly _emptyResult = false,
  ) {
    this.regexes = sources.map(s => new RegExp(s))
  }
  test(value: string) {
    if (this.regexes.length === 0) return this._emptyResult
    return this.regexes.some(r => r.test(value))
  }
}
