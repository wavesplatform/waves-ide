import React from 'react';
import { repl } from '@waves/ride-js';
import { observable } from 'mobx';
import { Line } from '@components/NewRepl/components/Line';
import { Input } from '@components/NewRepl/components/Input';
import styles from './styles.less';
import { observer } from 'mobx-react';

interface IProps {

}

interface IHistoryItemProps {
    command: string
    response: string[]
}

@observer
export default class RideRepl extends React.Component<IProps> {

    private repl = repl();

    @observable history: IHistoryItemProps[] = [{command: 'abra', response:["cadabra"]}];

    componentDidMount(): void {

    }

    render() {
        return <div className={styles.root}>
            <div className={styles.content}>
                {this.history.map((item, i) => <HistoryItem key={i}{...item}/>)}
            </div>
            <Input></Input>
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