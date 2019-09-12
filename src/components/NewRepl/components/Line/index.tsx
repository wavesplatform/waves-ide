import * as React from 'react';
import Help from './Help';
import Output from './Output';
import styles from './styles.less';
import Command from './Command';

interface IProps {
    value: any
    type?: 'response' | 'log' | 'help' | 'command'
    open?: boolean
    html?: boolean
    error?: boolean
    command?: string | null
}

interface IState {
}


export class Line extends React.Component<IProps, IState> {
    render() {
        const {type = 'response', value, command = null, error = false, open = false, html = false} = this.props;
        let line;

        line = {
            'help': <Help signatures={value}/>,
            'log': <Output value={value} type={type} error={error} html={html} open={open}/>,
            'response': <Output value={value} type={type} error={error} html={html} open={open}/>,
            'command':  <Command value={value}/>
        }[type];

        return <div className={styles.Line}>{line || null}</div>;
    }
}
