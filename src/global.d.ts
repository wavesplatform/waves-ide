declare interface ICompilationResult {
  result?: ArrayBuffer
  error?: string
  ast?: any
}

declare const compile: (code: string) => ICompilationResult
