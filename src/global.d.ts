declare interface ICompilationResult {
  result?: string
  error?: string
  ast?: any
}

declare const compile: (code: string) => ICompilationResult
