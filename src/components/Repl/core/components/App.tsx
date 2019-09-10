import * as React from 'react';
import * as PropTypes from 'prop-types';
import classnames from 'classnames';

import { Console } from './Console';
import { Input } from '../containers/Input';

import run, { bindConsole, createContainer } from '../lib/run';
import internalCommands from '../lib/internal-commands';
import { bindAPItoIFrame } from '../lib/contextBinding';

// this is lame, but it's a list of key.code that do stuff in the input that we _want_.
const doStuffKeys = /^(Digit|Key|Num|Period|Semi|Comma|Slash|IntlBackslash|Backspace|Delete|Enter)/;

export interface IAppProps {
    commands: any,
    layout: string
    theme: 'light' | 'dark',
    readOnly: boolean,
    className?: string
    style?: Record<string, number>,
    consoleRef: any
}

export class App extends React.Component<IAppProps, any> {
    private consoleRef: any;
    private app: any;
    private input: any;

    frame: any;

    static contextTypes = {store: PropTypes.object};

    constructor(props: any) {
        super(props);

        this.onRun = this.onRun.bind(this);
        this.triggerFocus = this.triggerFocus.bind(this);
    }

    log = (...args: any) => {
        console.log(...args);
    };

    async onRun(command: string) {
        const console = this.consoleRef;

        command = (command === 'clear()') ? ':clear' : command; //TODO do without hack

        if (command[0] !== ':') {
            console.push({
                type: 'command',
                command,
                value: command,
            });
            const res = await run(command, this.frame);
            console.push({
                command,
                type: (/help\(.*\)/.test(command) && (res as any).value) ? 'help' : 'response',
                ...res,
            });
            return;
        }

        let [cmd, ...args]: any[] = command.slice(1).split(' ');

        if (/^\d+$/.test(cmd)) {
            args = [parseInt(cmd, 10)];
            cmd = 'history';
        }


        if (!internalCommands[cmd]) {
            console.push({
                command,
                error: true,
                value: new Error(`No such jsconsole command "${command}"`),
                type: 'response',
            });
            return;
        }

        let res = await internalCommands[cmd]({args, console, app: this});

        if (typeof res === 'string') {
            res = {value: res};
        }

        if (res !== undefined) {
            console.push({
                command,
                type: 'log',
                ...res,
            });
        }

        return;
    }

    componentDidMount() {
        this.frame = createContainer();
        bindConsole(this.consoleRef, this.frame);
        bindAPItoIFrame( this.consoleRef, this.frame);

        const query = decodeURIComponent(window.location.search.substr(1));
        if (query) {
            this.onRun(query);
        } else if (!this.props.readOnly) {
            this.onRun(':welcome');
            // this.onRun('help()');
        }

        this.consoleRef.scrollToBottom();
    }

    triggerFocus(e: any) {
        if (e.target.nodeName === 'INPUT') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.code && !doStuffKeys.test(e.code)) return;

        //this.input.focus();
    }

    setConsoleRef = (el: Console) => {
        this.consoleRef = el;
        this.props.consoleRef(el);
    };

    render() {
        const {commands = [], theme, readOnly, layout, className: classNameProp, style} = this.props;

        const className = classnames(['App', `theme-${theme}`, layout, classNameProp]);

        return (
            <div
                style={style}
                tabIndex={-1}
                onKeyDown={this.triggerFocus}
                ref={e => (this.app = e)}
                className={className}
            >
                <Console
                    ref={this.setConsoleRef}
                    commands={commands}
                    reverse={layout === 'top'}
                />
                <Input
                    inputRef={(e: any) => (this.input = e)}
                    onRun={this.onRun}
                    autoFocus={window.top === window}
                    onClear={() => {
                        this.consoleRef.clear();
                    }}
                    readOnly={readOnly}
                    theme={this.props.theme}
                />
            </div>
        );
    }
}


