import React, { ReactNode } from 'react';
import { inject, observer } from 'mobx-react';

import Resizable, { ResizeCallback } from 're-resizable';

import { UIStore } from '@stores';

import styles from './styles.less';

const CLOSE_WIDTH = 24;
const MIN_WIDTH = 200;

const resizeEnableDirections = {
    top: false, right: true, bottom: false, left: false,
    topRight: false, bottomRight: false, bottomLeft: false, topLeft: false
};

interface IInjectedProps {
    uiStore?: UIStore
}

interface IState {}

interface IProps extends IInjectedProps {
    children: ReactNode
}

@inject('uiStore')
@observer
class SidePanelResizableWrapper extends React.Component<IProps, IState> {
    expand = () => {
        const sidePanel = this.props.uiStore!.sidePanel;

        const {
            width,
            isOpened,
        } = sidePanel;

        if (isOpened) {
            sidePanel.isOpened = false;
        } else {
            let isWidthLessThanMinWidth = width <= MIN_WIDTH;

            if (isWidthLessThanMinWidth) {
                sidePanel.width = MIN_WIDTH;

                sidePanel.isOpened = true;
            } else {
                sidePanel.isOpened = true;
            }
        }

    };

    private handleResizeStop: ResizeCallback = (event, direction, elementRef, delta) => {
        const sidePanel = this.props.uiStore!.sidePanel;

        const {
            width,
            isOpened
        } = sidePanel;

        const newWidth = delta.width + width;

        let isWidthLessThanMinWidth = newWidth <= MIN_WIDTH;

        if (isWidthLessThanMinWidth) {
            if (isOpened) {
                sidePanel.width = CLOSE_WIDTH;

                sidePanel.isOpened = false;
            } else {
                sidePanel.width = MIN_WIDTH;

                sidePanel.isOpened = true;
            }
        } else {
            sidePanel.width = newWidth;
            
            sidePanel.isOpened = true;
        }
    };
    
    render() {
        const {
            children,
            uiStore
        } = this.props;

        const {
            width,
            isOpened
        } = uiStore!.sidePanel;

        let computedWidth = isOpened ? width : CLOSE_WIDTH;

        return (
            <div className={styles.root}>
                <Resizable
                    size={{ width: computedWidth }}
                    minWidth={CLOSE_WIDTH}
                    defaultSize={{ width: MIN_WIDTH }}
                    enable={resizeEnableDirections}
                    onResizeStop={this.handleResizeStop}
                    className={styles.resizable}
                    handleWrapperClass={styles.resizer}
                >
                    {children}
                </Resizable>
            </div>
        );
    }
}

export default SidePanelResizableWrapper;
