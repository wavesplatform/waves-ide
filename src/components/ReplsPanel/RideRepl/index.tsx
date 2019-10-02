import React from 'react';
import { repl } from '@waves/ride-js';
import { action, observable } from 'mobx';
import { Line } from '@components/NewRepl/components/Line';
import { Input } from '@components/ReplsPanel/RideRepl/Input';
import styles from './styles.less';
import { observer } from 'mobx-react';
import Scrollbar from '@components/Scrollbar';

interface IProps {

}

interface IHistoryItemProps {
    command: string
    response: string[]
}

@observer
export default class RideRepl extends React.Component<IProps> {

    linesEndRef = React.createRef<HTMLDivElement>();
    scrollRef: any;

    private repl = repl();

    @observable history: IHistoryItemProps[] = [{command: 'abra', response: ['cadabra']}];

    @action
    handleSubmit = (cmd: string) => {
        const historyItem: IHistoryItemProps = observable({command: cmd, response: []});
        this.history.push(historyItem);
        const resultOrError = this.repl.evaluate(cmd);
        const resp = 'error' in resultOrError ? resultOrError.error : resultOrError.result;
        historyItem.response = [...historyItem.response, resp];
    };

    public scrollToBottom() {
        if (!this.linesEndRef) return;
        const offset = this.linesEndRef.current!.offsetTop;
        // hack: chrome fails to scroll correctly sometimes. Need to do it on next tick
        setTimeout(() => {
            // For whatever reason scrollIntoView is not working with perfect scrollbar. We need to manually scroll
            this.scrollRef.scrollTo(0, offset);
        }, 10);
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    render() {
        return <div className={styles.root}>
            <Scrollbar className={styles.content} containerRef={ref => this.scrollRef = ref}>
                {this.history.map((item, i) => <HistoryItem key={`line-${i}`}{...item}/>)}
                <div ref={this.linesEndRef}/>
            </Scrollbar>
            <Input onSubmit={this.handleSubmit}/>
        </div>;
    }
}

class HistoryItem extends React.Component<IHistoryItemProps> {
    render() {
        const {command, response} = this.props;
        return <>
            <Line value={command}/>
            {response.map((item, i) => <Line key={i} value={item}/>)}
        </>;
    }
}
