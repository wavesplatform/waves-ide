import React from 'react';
import { inject, observer } from 'mobx-react';
import withStyles, { StyledComponentProps } from 'react-jss';
import Resizable, { ResizeCallback } from 're-resizable';

import Button from '@material-ui/core/Button/Button';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { UIStore } from '@stores';

import styles from './styles';

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

interface IInjectedProps {
    uiStore?: UIStore
}

interface IState {}

interface IProps extends
    StyledComponentProps<keyof ReturnType<typeof styles>>,
    IInjectedProps {
        children: any
    }

@inject('uiStore')
@observer
class ReplsPanelResizableWrapper extends React.Component<IProps, IState> {
    private handleReplExpand = () => {
        const uiStore = this.props.uiStore;

        const {
            isOpened,
            height,
            lastHeight,
        } = uiStore!.replsPanel;

        isOpened
            ? uiStore!.updateReplsPanel(24, lastHeight, false)
            : uiStore!.updateReplsPanel(lastHeight, height, true);
    };

    private handleResizeStop: ResizeCallback = (event, direction, elementRef, delta) => {
        const { uiStore } = this.props;

        const {
            height,
            lastHeight
        } = uiStore!.replsPanel;

        const newHeight = delta.height + height;

        newHeight === 24
            ? uiStore!.updateReplsPanel(newHeight, lastHeight, false)
            : uiStore!.updateReplsPanel(newHeight, lastHeight, true);
    };
    
    render() {
        const {
            classes,
            children,
            uiStore
        } = this.props;

        const {
            isOpened,
            height
        } = uiStore!.replsPanel;

        return (
            <div className={classes!.root}>
                <Resizable
                    size={{height}}
                    minHeight={24}
                    maxHeight={800}
                    defaultSize={{height}}
                    enable={resizeEnableDirections}
                    onResizeStop={this.handleResizeStop}
                    className={classes!.resizable}
                >
                    <Button
                        type="text"
                        className={classes!.collapser}
                        onClick={this.handleReplExpand}
                    >
                        {isOpened
                            ? <ExpandMore style={{marginLeft: 'auto'}}/>
                            : <ExpandLess style={{marginLeft: 'auto'}}/>
                        }
                    </Button>
                    
                    {children}
                </Resizable>
            </div>
        );
    }
}

export default withStyles(styles)(ReplsPanelResizableWrapper);
