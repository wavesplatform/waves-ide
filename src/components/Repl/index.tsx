import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from './core/store';
import { setEnv } from './core/actions/Env';
import { App } from './core/containers/App';
import { Console } from './core/components/Console';
import './css/index.css';
import './core/jsconsole.css';
import WavesConsoleMethods from './WavesConsoleMethods';
import { observable } from "mobx";
import { observer } from "mobx-react";
import { setTheme } from "@components/Repl/core/actions/Settings";

interface IInjectedProps {
    // uiStore?: UIStore
}

interface IReplProps extends IInjectedProps {
    theme: string,
    readOnly: boolean,
    className?: string
    style?: Record<string, React.CSSProperties>
    env?: object
    withoutWelcome?: boolean
}

export class Repl extends React.Component<IReplProps> {
    private readonly store: any;
    private consoleRef: any;
    public methods: any;

    static defaultProps: IReplProps = {
        theme: 'light',
        readOnly: false
    };

    componentWillReceiveProps(nextProps: Readonly<IReplProps>, nextContext: any): void {
       if(nextProps.theme != this.props.theme) this.store.dispatch(setTheme(nextProps.theme));
    }

    constructor(props: IReplProps) {
        super(props);
        this.store = configureStore();
        // autorun(() => {
        //     const theme = this.props.uiStore!.editorSettings.isDarkTheme ? 'dark' : 'light';
        //     this.store.dispatch(setTheme(theme));
        // });

        if (props.theme) {
            this.store.dispatch(setTheme(props.theme));
        }
    }

    public updateEnv = (env: any): void => {
        this.store.dispatch(setEnv(env));
    };

    componentDidMount() {
        this.methods = new WavesConsoleMethods(this.consoleRef);
    }

    shouldComponentUpdate(nextProps: IReplProps) {
        const prevProps = this.props;

        const shouldUpdate = prevProps.theme === nextProps.theme && prevProps.readOnly === nextProps.readOnly;

        return shouldUpdate
            ? false
            : true;
    }

    render() {
        const {theme, readOnly, ...rest} = this.props;
        return (
            <Provider store={this.store}>
                <App
                    readOnly={readOnly}
                    consoleRef={(el: Console) => this.consoleRef = el}
                    methods={this.methods}
                    withoutWelcome={this.props.withoutWelcome}
                />
            </Provider>
        );
    }
}
