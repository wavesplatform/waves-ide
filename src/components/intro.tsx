import * as React from "react";
import ReactMarkdown from "react-markdown";
import axios from 'axios'

const baseUri = 'https://raw.githubusercontent.com/wavesplatform/waves-documentation/master/en'
const main = '/platform-features/smart-contracts.md'
const image = /\!\[\]\((\/_assets[^)]*)\)/gm
const link = /\[\*\*\w*\*\*]\(([^)]*)\)/gm

export class Intro extends React.Component {

  content: string = ''

  constructor(props:any) {
    super(props)
    axios.get(baseUri + main)
      .then(x => {
        this.content = x.data
        this.content = this.content.replace(image, (_, uri) => {
          return `![image](${baseUri}${uri})`
        }).replace(link, (_, uri) => {
          return _.replace(uri, baseUri + uri)
        })
        this.forceUpdate()
      }).catch(x => {
      })
  }

  componentDidMount() {
    //const root = document.getElementById('intro_root')
    //root.style.height = (window.innerHeight - root.getBoundingClientRect().top).toString() + 'px'
  }

  render() {
    return <div style={{ margin: 15 }}>
      {(this.content ? <ReactMarkdown source={this.content} /> : <div />)}
    </div>
  }
}