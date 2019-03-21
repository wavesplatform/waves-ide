import React from 'react';
import { inject, observer } from 'mobx-react';
import { Repl } from '@waves/waves-repl';

import { IProps, IState } from './types';

import TestReplMediatorContext from '@utils/ComponentsMediatorContext';

const replMethods = [
    'log',
    'error',
    'dir',
    'info',
    'warn',
    'assert',
    'debug',
    'clear',
];

@inject('replsStore')
@observer
class ReplWrapper extends React.Component<IProps, IState> {
    private replRef = React.createRef<Repl>();

    static contextType = TestReplMediatorContext;
    context!: React.ContextType<typeof TestReplMediatorContext>;

    private handleLog = (method: string, message: any) => {
        const replComponent = this.replRef.current;

        if (replComponent) {
            replComponent.methods.log(message);
        }
    };

    subscribeToComponentsMediator = () => {
        let ComponentsMediator = this.context;

        if (ComponentsMediator) {
            replMethods.forEach(method => {
                ComponentsMediator!.subscribe(
                    method,
                    this.handleLog.bind(null, method)
                );
            });
        }
    };

    componentDidMount() {
        const { name } = this.props;

        this.props.replsStore!.addRepl({
            name,
            instance: this.replRef.current!
        });

        this.subscribeToComponentsMediator();
    }

    render() {
        const { classes, theme } = this.props;
        
        return (
            <div className={classes!.replWrapper}>
                <Repl
                    ref={this.replRef}
                    theme={theme}
                /> 
            </div>
        );
    }
}

export default ReplWrapper;
