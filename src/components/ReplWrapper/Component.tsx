import React from 'react';
import { inject, observer } from 'mobx-react';
import { Repl } from '@waves/waves-repl';
import Resizable, { ResizeCallback } from 're-resizable';

import Button from '@material-ui/core/Button/Button';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

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

    state: IState = {
        height: 200,
        lastHeight: 200,
        isReplExpanded: true,
    };

    private handleReplExpand = () => {
        const {
            isReplExpanded,
            lastHeight,
            height
        } = this.state;

        isReplExpanded
            ? this.updateReplState(24, height, false)
            : this.updateReplState(lastHeight, height, true);
    };

    private handleResize: ResizeCallback = (event, direction, elementRef, delta) => {
        const lastHeight = this.state.height;
        const newHeight = delta.height + lastHeight;

        newHeight === 24
            ? this.updateReplState(newHeight, lastHeight, false)
            : this.updateReplState(newHeight, lastHeight, true);
    };

    private updateReplState = (
        height: number,
        lastHeight: number,
        isReplExpanded: boolean
    ): void => {
        this.setState({
            height,
            lastHeight,
            isReplExpanded
        });
    };

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

        const {
            isReplExpanded,
            height
        } = this.state;

        const resizeEnableDirections = {
            top: true,
            right: false,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
        };

        return (
            <div className={classes!.replWrapper}>
                <Resizable
                    size={{height}}
                    minHeight={24}
                    maxHeight={800}
                    defaultSize={{height}}
                    enable={resizeEnableDirections}
                    onResizeStop={this.handleResize}
                    className={classes!.replWrapper_resizable}
                >
                    <div className="repl_actions">
                        <Button
                            type="text"
                            className={classes!.replWrapper_collapser}
                            onClick={this.handleReplExpand}
                        >
                            {isReplExpanded
                                ? <ExpandMore style={{marginLeft: 'auto'}}/>
                                : <ExpandLess style={{marginLeft: 'auto'}}/>
                            }
                        </Button>
                    </div>

                    <div className={classes!.replWrapper_scrollContainer}>
                        <Repl
                            ref={this.replRef}
                            theme={theme}
                        /> 
                    </div>
                </Resizable>
            </div>
        );
    }
}

export default ReplWrapper;
