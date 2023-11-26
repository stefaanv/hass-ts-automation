export class MultiRegex {
  private readonly regexes: RegExp[]
  constructor(sources: string[]) {
    this.regexes = sources.map(s => new RegExp(s))
  }
  test(value: string) {
    return this.regexes.some(r => r.test(value))
  }
}
