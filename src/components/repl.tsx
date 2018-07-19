import * as React from "react"
import { connect } from 'react-redux'
import { IAppState } from "../state"

export class repl extends React.Component<{}>
{
  constructor(props) {
    super(props)
  }

  componentDidMount() {
  }

  render() {
    return <div />
  }
}

const mapStateToProps = (state: IAppState) => {
  return {}
}

const mapDispatchToProps = (dispatch) => ({})

export const Repl = connect(mapStateToProps, mapDispatchToProps)(repl)