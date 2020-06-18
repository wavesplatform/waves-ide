import React, { Component } from 'react';
import styles from './styles.less';

export class Loading extends Component<{ text?: string }, { length: number }> {

    interval: ReturnType<typeof setInterval> | null = null;

    constructor(props: any) {
        super(props);
        this.state = {length: 3};

        this.interval = setInterval(() => {
            let length = this.state.length + 1;
            if (this.state.length === 3) length = 1;
            this.setState({length});
        }, 500);
    }

    componentWillUnmount(): void {
        this.interval && clearInterval(this.interval);
    }

    render() {
        return <div className={styles.placeholder}>
            <div className={styles.text}>{this.props.text || 'Loading'}</div>
            <div className={styles.dots}>{Array.from(this.state, () => '.')}</div>
        </div>;
    }
}
