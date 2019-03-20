import React, { Component } from 'react';
import withStyles, { StyledComponentProps } from 'react-jss';
import { inject, observer } from 'mobx-react';
import Resizable, { ResizeCallback } from 're-resizable';

import Button from '@material-ui/core/Button/Button';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { UIStore } from '@stores';

import styles from './styles';

const defaultMinWidth = 200;
const defaultMaxWidth = 500;

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
class SidePanelResizableWrapper extends Component<IProps, IState> {
    state: IState = {
        width: 300,
        lastWidth: 300,
        lastDelta: 0,
        isOpened: true
    };

    private handleReplExpand = () => {
        const uiStore = this.props.uiStore;

        const {
            lastWidth,
            lastDelta,
            isOpened,
        } = uiStore!.sidePanel;


        // TO DO
        // isOpened
        //     ? uiStore!.updateSidePanel(24, lastWidth, lastDelta, false)
        //     : uiStore!.updateSidePanel(lastWidth, lastWidth, 0, true);
    };

    private handleResize: ResizeCallback = (event, direction, elementRef, delta) => {
        const uiStore = this.props.uiStore;

        const {
            width,
            lastDelta
        } = uiStore!.sidePanel;

        const lastWidth = width;

        let newWidth = lastWidth === 10
            ? 0
            : delta.width + lastWidth - lastDelta;

        uiStore!.updateSidePanel(newWidth, lastWidth, delta.width, true);
    };

    private handleResizeStop: ResizeCallback = () => {
        const uiStore = this.props.uiStore;

        const {
            width,
            lastWidth,
            lastDelta
        } = uiStore!.sidePanel;

        let isOpened = width > defaultMinWidth;

        let newWidth = isOpened ? width : 10;

        uiStore!.updateSidePanel(newWidth, 0, 0, isOpened);
    };

    render() {
        const {
            classes,
            children,
            uiStore
        } = this.props;

        const {
            isOpened,
            width
        } = uiStore!.sidePanel;

        const resizeEnableDirections = {
            top: false, right: true, bottom: false, left: false,
            topRight: false, bottomRight: false, bottomLeft: false, topLeft: false,
        };

        return (
            <Resizable
                size={{ width }}
                maxWidth={defaultMaxWidth}
                enable={resizeEnableDirections}
                defaultSize={{ width }}
                onResizeStop={this.handleResizeStop}
                onResize={this.handleResize}
                className={classes!.resizable}
            >
                <Button
                    type="text"
                    className={classes!.collapser}
                    onClick={this.handleReplExpand}
                >
                    {isOpened
                        ? <ExpandMore className={classes!.expandBtn}/>
                        : <ExpandLess className={classes!.expandBtn}/>
                    }
                </Button>

                {children}
            </Resizable>
        );
    }
}

export default withStyles(styles)(SidePanelResizableWrapper);
