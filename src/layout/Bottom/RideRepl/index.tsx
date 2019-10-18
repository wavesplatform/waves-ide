import React from 'react';
import { Line } from '@components/NewRepl/components/Line';
import { Input } from './Input';
import styles from './styles.less';
import { inject, observer } from 'mobx-react';
import Scrollbar from '@components/Scrollbar';
import { IRideReplHistoryItem, RideReplStore } from '@stores';

interface IProps {
    rideReplStore?: RideReplStore
}

@inject('rideReplStore')
@observer
export default class RideRepl extends React.Component<IProps> {

    linesEndRef = React.createRef<HTMLDivElement>();


    public scrollToBottom() {
        if (!this.linesEndRef) return;
        this.linesEndRef.current!.scrollIntoView();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    render() {
        const {processCommand, history, getHistoryCommand} = this.props.rideReplStore!;

        return <div className={styles.root}>
            <div className={styles.toolbar}/>
            <Scrollbar className={styles.content}>
                {history.map((item, i) => <HistoryItem key={`line-${i}`}{...item}/>)}
                <div ref={this.linesEndRef}/>
            </Scrollbar>
            <Input onSubmit={processCommand} getHistoryCommand={getHistoryCommand}/>
        </div>;
    }
}

const HistoryItem: React.FC<IRideReplHistoryItem> = ({command, response}) => <>
    <Line value={command} type="command"/>
    {response.map((item, i) => <Line key={i} value={item} type="command"/>)}
</>;

