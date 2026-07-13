import React from 'react';

type TRenderParams = {
    width?: number
    height?: number
};

interface IResizeDetectorProps {
    handleWidth?: boolean
    handleHeight?: boolean
    render: (size: TRenderParams) => React.ReactNode
}

interface IResizeDetectorState {
    width?: number
    height?: number
}

export default class ResizeDetector extends React.Component<IResizeDetectorProps, IResizeDetectorState> {
    private rootRef = React.createRef<HTMLDivElement>();
    private observer?: ResizeObserver;

    state: IResizeDetectorState = {};

    componentDidMount() {
        if (!this.rootRef.current) return;

        this.observer = new ResizeObserver(entries => {
            const entry = entries[0];
            if (!entry) return;

            const nextState: IResizeDetectorState = {};
            if (this.props.handleWidth) nextState.width = entry.contentRect.width;
            if (this.props.handleHeight) nextState.height = entry.contentRect.height;
            this.setState(nextState);
        });

        this.observer.observe(this.rootRef.current);
    }

    componentWillUnmount() {
        this.observer?.disconnect();
    }

    render() {
        return (
            <div ref={this.rootRef} style={{width: '100%', height: '100%'}}>
                {this.props.render(this.state)}
            </div>
        );
    }
}
