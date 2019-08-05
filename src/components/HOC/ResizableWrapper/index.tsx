import React from 'react';
import { inject, observer } from 'mobx-react';

import Resizable, { ResizeCallback } from 're-resizable';

import { UIStore } from '@stores';

import styles from './styles.less';
import classNames from 'classnames';

const resizeEnableDirections = {
    top: false, right: false, bottom: false, left: false,
    topRight: false, bottomRight: false, bottomLeft: false, topLeft: false,
};


interface IResizableWrapperProps {
    uiStore?: UIStore,
    resizeSide: 'top' | 'right'
    storeKey: string
    disableClose?: boolean
    minSize: number
    maxSize?: number
    closedSize?: number
}

export interface IResizableProps {
    isOpened: boolean
    handleExpand: () => void
}


export function withResizableWrapper<P extends IResizableProps>(WrappedComponent: React.ComponentClass<P>) {

    @inject('uiStore')
    @observer
    class AugmentedComponent extends React.Component<Omit<P, keyof IResizableProps> & IResizableWrapperProps> {


        get sizeParam(): ('height' | 'width') {
            return this.props.resizeSide === 'top' ? 'height' : 'width';
        }

        expand = () => {
            const {storeKey, minSize} = this.props;
            const panel = this.props.uiStore!.resizables[storeKey];
            const {size, isOpened} = panel;

            if (isOpened) {
                panel.isOpened = false;
            } else {
                let isSizeLessThanMinSize = size <= minSize;

                if (isSizeLessThanMinSize) {
                    panel.size = minSize;
                    panel.isOpened = true;
                } else {
                    panel.isOpened = true;
                }
            }
        };

        private handleResizeStop: ResizeCallback = (event, direction, elementRef, delta) => {
            const {storeKey, disableClose, minSize} = this.props;
            const panel = this.props.uiStore!.resizables[storeKey];
            const {size, isOpened} = panel;

            const newSize = delta[this.sizeParam] + size;
            let isNewSizeLessThanMinSize = newSize <= minSize;

            if (isNewSizeLessThanMinSize && !disableClose) {
                if (isOpened) {
                    panel.size = (this.props.closedSize as number) || 20;

                    panel.isOpened = false;
                } else {
                    panel.size = minSize;

                    panel.isOpened = true;
                }
            } else if (isNewSizeLessThanMinSize && disableClose) {
                panel.size = minSize;
            } else {
                panel.size = newSize;
                panel.isOpened = true;
            }
        };

        render() {
            const {resizeSide, uiStore, storeKey, maxSize, disableClose, minSize, closedSize, ...rest} = this.props;
            const {size, isOpened} = uiStore!.resizables[storeKey];
            let computedSize = isOpened ? size : closedSize;

            let minHeight, minWidth;
            if (resizeSide === 'top') minHeight = disableClose ? minSize : closedSize;
            if (resizeSide === 'right') minWidth = disableClose ? minSize : closedSize;

            return (
                <Resizable
                    size={{[this.sizeParam]: computedSize}}
                    minHeight={minHeight}
                    minWidth={minWidth}
                    maxHeight={resizeSide === 'top' ? maxSize : undefined}
                    maxWidth={resizeSide === 'right' ? maxSize : undefined}
                    defaultSize={{[this.sizeParam]: minSize}}
                    enable={{...resizeEnableDirections, [resizeSide]: true}}
                    onResizeStop={this.handleResizeStop}
                    className={classNames(styles['resizable-' + resizeSide], styles.resizable)}
                    handleWrapperClass={styles['resizer-' + resizeSide]}

                >
                    <WrappedComponent isOpened={isOpened} handleExpand={this.expand}  {...rest as unknown as P}/>
                </Resizable>
            );
        }
    }

    return AugmentedComponent;
}

