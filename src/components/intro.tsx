import * as React from "react";
import { render } from 'react-dom';
import { Store } from 'redux'
import { connect } from 'react-redux'
import MonacoEditor from 'react-monaco-editor';
import { IEditorState, IAppState, getCurrentEditor } from "../state";
import { txFields, generalSuggestions, cryptoFunctions, contextFunctions, contextFields } from "./lang/suggestions";
import { editorCodeChange } from "../store";
import ReactResizeDetector from "react-resize-detector"
import * as ReactMarkdown from "react-markdown";
import { stat } from "fs";
import { intro } from "./../assets/intro"
import axios from 'axios'

const baseUri = 'https://raw.githubusercontent.com/wavesplatform/waves-documentation/master'
const main = '/platform-features/smart-contracts.md'
const image = /\!\[\]\((?<uri>\/_assets[^)]*)\)/gm
const link = /\[\*\*\w*\*\*]\(([^)]*)\)/gm

export class Intro extends React.Component {

  content: string

  constructor(props) {
    super(props)
    axios.get(baseUri + main)
      .then(x => {
        this.content = x.data
        this.content = this.content.replace(image, (_, uri) => {
          return `![image](${baseUri}${uri})`
        }).replace(link, (_, uri) => {
          console.log(_)
          console.log(uri)
          return _.replace(uri, baseUri + uri)
        })
        this.forceUpdate()
      })
  }

  componentDidMount() {
    const root = document.getElementById('intro_root')
    root.style.height = (window.innerHeight - root.getBoundingClientRect().top).toString() + 'px'
  }

  render() {
    return <div id='intro_root' style={{ overflowY: 'scroll' }}><div style={{ margin: 15 }}>
      {(this.content ? <ReactMarkdown source={this.content} /> : <div />)}
    </div></div>
  }
}