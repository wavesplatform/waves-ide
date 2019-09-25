import React from 'react';
import { repl } from '@waves/ride-js';
import { observable } from 'mobx';
import { Line } from '@components/NewRepl/components/Line';
import { Input } from '@components/NewRepl/components/Input';

interface IProps {

}

interface IHistoryItemProps {
    command: string
    response: string[]
}
export default class RideRepl extends React.Component<IProps> {

    private repl = repl();

    @observable history: IHistoryItemProps[] = [];

    componentDidMount(): void {

    }

    render(){
        return <div>
            {this.history.map(item => <HistoryItem {...item}/>)}
            <Input></Input>
        </div>
    }
}

class HistoryItem extends React.Component<IHistoryItemProps> {
    render(){
        const {command, response} =  this.props;
        return <>
            <Line value={command}/>
            {response.map(item => <Line value={item}/>)}
        </>
    }
}
