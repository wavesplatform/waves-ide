import React, { Component } from 'react';
import withStyles, { StyledComponentProps } from 'react-jss';
import { inject, observer } from 'mobx-react';
import Resizable, { ResizeCallback } from 're-resizable';

import Button from '@material-ui/core/Button/Button';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { UIStore } from '@stores';

import styles from './styles';

const CloseWidth = 24;
const MinWidth = 200;
const MaxWidth = 500;

const resizeEnableDirections = {
    top: false, right: true, bottom: false, left: false,
    topRight: false, bottomRight: false, bottomLeft: false, topLeft: false,
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
class SidePanelResizableWrapper extends Component<IProps, IState> {
    private prevWidth: number = MinWidth;

    private handleReplExpand = () => {
        const uiStore = this.props.uiStore;

        const {
            width,
            isOpened,
        } = uiStore!.sidePanel;

        if (isOpened) {
            uiStore!.updateSidePanel(CloseWidth);

            this.prevWidth = width;
        } else {
            let isPrevWidthLessThanMinWidth = this.prevWidth <= 200;

            if (isPrevWidthLessThanMinWidth) {
                uiStore!.updateSidePanel(MinWidth);

                this.prevWidth = MinWidth;
            } else {
                uiStore!.updateSidePanel(this.prevWidth);

                this.prevWidth = width;
            }
        }

    };

    private handleResizeStop: ResizeCallback = (event, direction, elementRef, delta) => {
        const { uiStore } = this.props;

        const {
            isOpened,
            width
        } = uiStore!.sidePanel;

        const newWidth = delta.width + width;

        let isWidthtLessThanMinWidth = newWidth < MinWidth;

        if (isWidthtLessThanMinWidth) {
            if (isOpened) {
                uiStore!.updateSidePanel(CloseWidth);

                this.prevWidth = CloseWidth;
            } else {
                uiStore!.updateSidePanel(MinWidth);

                this.prevWidth = MinWidth;
            }
        } else {
            uiStore!.updateSidePanel(newWidth);

            this.prevWidth = width;
        }
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

        return (
            <Resizable
                size={{ width }}
                maxWidth={MaxWidth}
                minWidth={CloseWidth}
                enable={resizeEnableDirections}
                defaultSize={{ width: MinWidth }}
                onResizeStop={this.handleResizeStop}
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
