import React, { ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';

import Resizable, { ResizeCallback } from 're-resizable';

import { UIStore } from '@stores';

import styles from './styles.less';

const CloseHeight = 48;
const MinHeight = 200;
const MaxHeight = 800;

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
    private prevHeight: number = MinHeight;

    expandRepl = () => {
        const uiStore = this.props.uiStore;

        const {
            height,
            isOpened,
        } = uiStore!.replsPanel;

        if (isOpened) {
            uiStore!.updateReplsPanel(CloseHeight);

            this.prevHeight = height;
        } else {
            let isPrevHeightLessThanMinHeight = this.prevHeight <= 200;

            if (isPrevHeightLessThanMinHeight) {
                uiStore!.updateReplsPanel(MinHeight);

                this.prevHeight = MinHeight;
            } else {
                uiStore!.updateReplsPanel(this.prevHeight);

                this.prevHeight = height;
            }
        }

    };

    private handleResizeStop: ResizeCallback = (event, direction, elementRef, delta) => {
        const { uiStore } = this.props;

        const {
            height,
            isOpened
        } = uiStore!.replsPanel;

        const newHeight = delta.height + height;

        let isHeightLessThanMinHeight = newHeight < MinHeight;

        if (isHeightLessThanMinHeight) {
            if (isOpened) {
                uiStore!.updateReplsPanel(CloseHeight);

                this.prevHeight = CloseHeight;
            } else {
                uiStore!.updateReplsPanel(MinHeight);

                this.prevHeight = MinHeight;
            }
        } else {
            uiStore!.updateReplsPanel(newHeight);

            this.prevHeight = height;
        }
    };
    
    render() {
        const {
            children,
            uiStore
        } = this.props;

        const {
            height
        } = uiStore!.replsPanel;

        return (
            <div className={styles.root}>
                <Resizable
                    size={{ height }}
                    minHeight={CloseHeight}
                    maxHeight={MaxHeight}
                    defaultSize={{ height: MinHeight }}
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
