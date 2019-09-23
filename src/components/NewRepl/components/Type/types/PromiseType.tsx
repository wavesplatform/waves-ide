import React from 'react';
import which from '../which-type';
import { ITypeState } from './ITypeState';

interface IPromiseTypeProps {
    allowOpen: boolean,
    open: boolean,
    value: any,
    filter?: any,
}

interface IPromiseTypeState extends ITypeState {
    promiseValue: any,
    status: string
}

export class PromiseType extends React.Component<IPromiseTypeProps, IPromiseTypeState> {
    constructor(props: IPromiseTypeProps) {
        super(props);
        this.toggle = this.toggle.bind(this);

        this.state = {
            open: props.open,
            promiseValue: undefined,
            status: 'pending',
        };
    }

    async toggle(e: React.MouseEvent) {
        if (!this.props.allowOpen) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
        const open = !this.state.open;

        if (open) {
            // update promise value
            const {promiseValue, status} = await this.updatePromiseState();
            return this.setState({promiseValue, status, open});
        }

        this.setState({open});
    }

    async updatePromiseState() {
        let promiseValue = undefined;
        let status = 'pending';

        const flag = Math.random();
        try {
            promiseValue = await Promise.race([
                this.props.value,
                new Promise(resolve => setTimeout(() => resolve(flag), 10)),
            ]);

            if (promiseValue !== flag) {
                status = 'resolved';
            } else {
                promiseValue = undefined;
            }
        } catch (e) {
            promiseValue = e;
            status = 'rejected';
        }

        return {
            promiseValue,
            status,
        };
    }

    async componentDidMount() {
        const {promiseValue, status} = await this.updatePromiseState();
        this.setState({promiseValue, status});
    }

    render() {
        const {filter} = this.props;
        const {open, promiseValue, status} = this.state;

        const Value = which(promiseValue);

        if (!open) {
            return (
                <div className="type entry closed">
                    <em onClick={this.toggle}>Promise</em>
                    {'{ '}
                    <div className="object-item key-value">
                        <span className="key">[[PromiseStatus]]:</span>
                        <span className="value">{status}</span>
                    </div>
                    <span className="arb-info">, </span>
                    <div className="object-item key-value">
                        <span className="key">[[PromiseValue]]:</span>
                        <span className="value"
                              onClick={this.toggle}>
                            <Value
                                filter={filter}
                                shallow={true}
                                allowOpen={open}
                                value={promiseValue}
                            />
                        </span>
                    </div>
                    {' }'}
                </div>
            );
        }

        return (
            <div className="type promise">
                <div className="header">
                    <em onClick={this.toggle}>Promise</em>
                    <span>{'{'}</span>
                </div>
                <div className="group">
                    <div className="object-item key-value">
                        <span className="key">[[PromiseStatus]]:</span>
                        <span className="value">{status}</span>
                    </div>
                    <div className="object-item key-value">
                        <span className="key">[[PromiseValue]]:</span>
                        <span className="value">
                            <Value
                                filter={filter}
                                shallow={true}
                                allowOpen={open}
                                value={promiseValue}
                            />
            </span>
                    </div>
                </div>
                <span>{'}'}</span>
            </div>
        );
    }
}
