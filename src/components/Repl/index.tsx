import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from './core/store';
import { setEnv } from './core/actions/Env';
import { setTheme } from './core/actions/Settings';
import { App } from './core/containers/App';
import { Console } from './core/components/Console';
import './css/index.css';
import './core/jsconsole.css';
import { WavesConsoleAPI } from './WavesConsoleAPI';
import WavesConsoleMethods from './WavesConsoleMethods';

interface IReplProps {
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
    public API: WavesConsoleAPI;
    public methods: any;

    static defaultProps: IReplProps = {
        theme: 'light',
        readOnly: false
    };

    constructor(props: IReplProps){
        super(props);

        this.store = configureStore();

        this.API = new WavesConsoleAPI();

        if (props.theme) {
            this.store.dispatch(setTheme(props.theme));
        }
    }

    public updateEnv = (env: any): void => {
        this.store.dispatch(setEnv(env));
    }

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
                    api={this.API}
                    methods={this.methods}
                    withoutWelcome={this.props.withoutWelcome}
            />
            </Provider>
        );
    }
}
