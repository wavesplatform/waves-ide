import React, { ReactNode } from 'react';
import { inject, observer } from 'mobx-react';

import Resizable, { ResizeCallback } from 're-resizable';

import { UIStore } from '@stores';

import styles from './styles.less';

const CLOSE_HEIGHT = 48;
const MIN_HEIGHT = 200;

const resizeEnableDirections = {
    top: true, right: false, bottom: false, left: false,
    topRight: false, bottomRight: false, bottomLeft: false, topLeft: false,
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
class ReplsPanelResizableWrapper extends React.Component<IProps, IState> {
    expand = () => {
        const replsPanel = this.props.uiStore!.replsPanel;

        const {
            height,
            isOpened,
        } = replsPanel;

        if (isOpened) {
            replsPanel.isOpened = false;
        } else {
            let isHeightLessThanMinHeight = height <= MIN_HEIGHT;

            if (isHeightLessThanMinHeight) {
                replsPanel.height = MIN_HEIGHT;

                replsPanel.isOpened = true;
            } else {
                replsPanel.isOpened = true;
            }
        }

    };

    private handleResizeStop: ResizeCallback = (event, direction, elementRef, delta) => {
        const replsPanel = this.props.uiStore!.replsPanel;

        const {
            height,
            isOpened
        } = replsPanel;

        const newHeight = delta.height + height;

        let isNewHeightLessThanMinHeight = newHeight <= MIN_HEIGHT;

        if (isNewHeightLessThanMinHeight) {
            if (isOpened) {
                replsPanel.height = CLOSE_HEIGHT;

                replsPanel.isOpened = false;
            } else {
                replsPanel.height = MIN_HEIGHT;

                replsPanel.isOpened = true;
            }
        } else {
            replsPanel.height = newHeight;
            
            replsPanel.isOpened = true;
        }
    };
    
    render() {
        const {
            children,
            uiStore
        } = this.props;

        const {
            height,
            isOpened
        } = uiStore!.replsPanel;

        let computedHeight = isOpened ? height : CLOSE_HEIGHT;

        return (
            <div className={styles.root}>
                <Resizable
                    size={{ height: computedHeight }}
                    minHeight={CLOSE_HEIGHT}
                    // maxHeight={window.outerHeight}
                    defaultSize={{ height: MIN_HEIGHT }}
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

export default ReplsPanelResizableWrapper;
