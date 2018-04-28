
export interface IEditorState {
  code: string
  compilationResult?: ICompilationResult
}

export interface IAppState {
  editor: IEditorState,
}