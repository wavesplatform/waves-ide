import React from 'react';
import styles from '../styles.less';

interface IScriptInfoProps {
    nodeUrl: string
    base64: string
    scriptSize?: number
}

interface IScriptInfoState {
    prevBase64: string
    resp: any
}

export default class ScriptComplexity extends React.Component<IScriptInfoProps, IScriptInfoState> {
    state = {
        prevBase64: '',
        resp: null
    };

    private updateRequest?: Promise<any>;
    private currentBase64: string | null = null;

    static getDerivedStateFromProps(props: IScriptInfoProps, state: IScriptInfoState) {
        // Store prevBase64 in state so we can compare when props change.
        // Clear out previously-loaded data (so we don't render stale stuff).
        if (props.base64 !== state.prevBase64) {
            return {
                resp: null,
                prevBase64: props.base64,
            };
        }

        // No state update necessary
        return null;
    }

    updateScriptInfo(base64: string) {
        if (base64 === this.currentBase64) {
            // Data for this script is already loading
            return;
        }

        this.currentBase64 = base64;

        const {nodeUrl} = this.props;

        const url = new URL('utils/script/estimate', nodeUrl).href;
        this.updateRequest = fetch(url, {body: base64, method: 'POST'})
            .then(resp => resp.json())
            .then(json => {
                if (base64 === this.currentBase64) {
                    this.setState(() => ({resp: json}));
                }
            })
            .catch(console.error);
    }

    componentDidMount() {
        this.updateScriptInfo(this.props.base64);
    }

    componentDidUpdate() {
        if (this.state.resp === null) {
            this.updateScriptInfo(this.props.base64);
        }
    }

    componentWillUnmount() {
        this.currentBase64 = null;
    }

    render() {
        const {resp} = this.state;
        return <div style={{float: 'left', margin: '10px 15px'}}>
            <span>Script size: </span>
            <span className={styles!.boldText}> {this.props.scriptSize || 0} bytes</span>
            <span>Script complexity: </span>
            <span className={styles!.boldText}>
                <React.Fragment>{resp != null ? (resp as any).complexity : 'unknown'}</React.Fragment> / 2000
            </span>
        </div>;
    }
}
