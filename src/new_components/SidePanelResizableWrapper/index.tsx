import React, { Component } from 'react';
import Resizable, { ResizeCallback } from 're-resizable';

const defaultMinWidth = 200;
const defaultMaxWidth = 500;

type IState = {
    open: boolean
    width: number
    lastWidth: number
    lastDelta: number
    editingTab: string
};

interface IProps {}

class SidePanelResizableWrapper extends Component<IProps, IState> {
    state: IState = {
        width: 300,
        lastWidth: 300,
        lastDelta: 0,
        open: true,
        editingTab: ''
    };

    private handleResize: ResizeCallback = (event, direction, elementRef, delta) => {
        const lastWidth = this.state.width;

        let newWidth = lastWidth === 10
            ? 0
            : delta.width + lastWidth - this.state.lastDelta;

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

        const { children } = this.props;

        return (
            <Resizable
                size={{ width }}
                maxWidth={defaultMaxWidth}
                enable={resizeEnableDirections}
                defaultSize={{ width }}
                onResizeStop={this.handleResizeStop}
                onResize={this.handleResize}
            >
                {children}
            </Resizable>
        );
    }
}

export default SidePanelResizableWrapper;
