import React, { Component } from 'react';
import styles from './styles.less';
import Resizable, { ResizeCallback } from 're-resizable';
import Explorer from './index';

type IFileExplorerState = {
    open: boolean
    width: number
    lastWidth: number
    lastDelta: number
    editingTab: string
};

interface IInjectedProps {
}

const defaultMinWidth = 200;
const defaultMaxWidth = 500;

export default class ExplorerWrapper extends Component<IInjectedProps, IFileExplorerState> {

    constructor(props: IInjectedProps) {
        super(props);

        this.state = {
            width: 300,
            lastWidth: 300,
            lastDelta: 0,
            open: true,
            editingTab: ''
        };
    }

    private handleResize: ResizeCallback = (event, direction, elementRef, delta) => {
        const lastWidth = this.state.width;
        let newWidth = lastWidth === 10 ? 0 : delta.width + lastWidth - this.state.lastDelta;
        this.updateState(newWidth, lastWidth, delta.width, true);
    };

    private handleResizeStop: ResizeCallback = () => {
        let open = this.state.width > defaultMinWidth;
        let width = open ? this.state.width : 10;
        this.updateState(width, 0, 0, open);
    };

    private updateState = (width: number, lastWidth: number, lastDelta: number, open: boolean): void =>
        this.setState({width, lastWidth, lastDelta, open});

    render() {
        const width = this.state.width as number;
        const resizeEnableDirections = {
            top: false, right: true, bottom: false, left: false,
            topRight: false, bottomRight: false, bottomLeft: false, topLeft: false,
        };

        return (
            <Resizable
                className={styles.noScroll}
                size={{width}}
                maxWidth={defaultMaxWidth}
                enable={resizeEnableDirections}
                defaultSize={{width}}
                onResizeStop={this.handleResizeStop}
                onResize={this.handleResize}
            >
                {this.state.open && <Explorer/>}
            </Resizable>
        );
    }
}

