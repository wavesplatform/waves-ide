import React from 'react';
import styles from './styles.less';
import classNames from 'classnames';

interface IScrollbarProps {
    children?: any
    className?: string
    onScrollX?: (ref: any) => void
    suppressScrollX?: boolean
    suppressScrollY?: boolean
    containerRef?: (ref: any) => void
}

export default class Scrollbar extends React.Component<IScrollbarProps> {
    private rootRef = React.createRef<HTMLDivElement>();

    componentDidMount() {
        const { containerRef } = this.props;

        if (containerRef) {
            containerRef(this.rootRef.current);
        }
    }

    componentDidUpdate() {
        const { containerRef } = this.props;

        if (containerRef) {
            containerRef(this.rootRef.current);
        }
    }

    private handleScroll = () => {
        const { onScrollX } = this.props;

        if (onScrollX && this.rootRef.current) {
            onScrollX(this.rootRef.current);
        }
    };

    render() {
        const {children, className, suppressScrollX, suppressScrollY} = this.props;

        return <div
            ref={this.rootRef}
            onScroll={this.handleScroll}
            className={classNames(styles.root, className)}
            style={{
                overflowX: suppressScrollX ? 'hidden' : 'auto',
                overflowY: suppressScrollY ? 'hidden' : 'auto'
            }}
        >
            {children}
        </div>;
    }
}
