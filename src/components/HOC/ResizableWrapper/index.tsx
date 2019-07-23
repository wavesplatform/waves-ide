import React from 'react';
import { inject, observer } from 'mobx-react';

import Resizable, { ResizeCallback } from 're-resizable';

import { UIStore } from '@stores';

import styles from './styles.less';
import classNames from 'classnames';


const CLOSE_HEIGHT = 48;
const MIN_HEIGHT = 200;
const CLOSE_WIDTH = 24;
const MIN_WIDTH = 225;

const resizeEnableDirections = {
    top: false, right: false, bottom: false, left: false,
    topRight: false, bottomRight: false, bottomLeft: false, topLeft: false,
};


interface IResizableWrapperProps {
    uiStore?: UIStore,
    resizeSide: 'top' | 'right'
    storeKey: string
    disableExpand?: boolean
    minSize?: number
    maxSize?: number
    closeSize?: number
}

export interface IResizableProps {
    isOpened: boolean
    handleExpand: () => void
}


export function withResizableWrapper<P extends IResizableProps>(WrappedComponent: React.ComponentClass<P>) {

    @inject('uiStore')
    @observer
    class AugmentedComponent extends React.Component<Omit<P, keyof IResizableProps> & IResizableWrapperProps> {

        get minSize(): number {
            const {resizeSide, minSize} = this.props;
            if (minSize !== undefined) return minSize as number;
            if (resizeSide === 'top') return MIN_HEIGHT;
            if (resizeSide === 'right') return MIN_WIDTH;
            else return 0;
        }

        get closeSize(): number {
            const {resizeSide, closeSize} = this.props;
            if (closeSize !== undefined) return closeSize as number;
            if (resizeSide === 'top') return CLOSE_HEIGHT;
            if (resizeSide === 'right') return CLOSE_WIDTH;
            else return 0;
        }

        get sizeParam(): ('height' | 'width') {
            return this.props.resizeSide === 'top' ? 'height' : 'width';
        }

        expand = () => {
            const {storeKey} = this.props;
            const panel = this.props.uiStore!.resizables[storeKey];
            const {size, isOpened} = panel;

            if (isOpened) {
                panel.isOpened = false;
            } else {
                let isSizeLessThanMinSize = size <= this.minSize;

                if (isSizeLessThanMinSize) {
                    panel.size = this.minSize;
                    panel.isOpened = true;
                } else {
                    panel.isOpened = true;
                }
            }
        };

        private handleResizeStop: ResizeCallback = (event, direction, elementRef, delta) => {
            const {storeKey, disableExpand} = this.props;
            const panel = this.props.uiStore!.resizables[storeKey];
            const {size, isOpened} = panel;

            const newSize = delta[this.sizeParam] + size;
            let isNewSizeLessThanMinSize = newSize <= this.minSize;

            if (isNewSizeLessThanMinSize && !disableExpand) {
                if (isOpened) {
                    panel.size = this.closeSize;

                    panel.isOpened = false;
                } else {
                    panel.size = this.minSize;

                    panel.isOpened = true;
                }
            } else {
                panel.size = newSize;

                panel.isOpened = true;
            }
        };

        render() {
            const {resizeSide, uiStore, storeKey, maxSize, disableExpand, ...rest} = this.props;
            const {size, isOpened} = uiStore!.resizables[storeKey];
            let computedSize = isOpened ? size : this.closeSize;

            let minHeight, minWidth;
            if (resizeSide === 'top') minHeight = disableExpand ? this.minSize : this.closeSize;
            if (resizeSide === 'right') minWidth = disableExpand ? this.minSize : this.closeSize;

            return (
                <Resizable
                    size={{[this.sizeParam]: computedSize}}
                    minHeight={minHeight}
                    minWidth={minWidth}
                    maxHeight={resizeSide === 'top' ? maxSize : undefined}
                    maxWidth={resizeSide === 'right' ? maxSize : undefined}
                    defaultSize={{[this.sizeParam]: this.minSize}}
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

