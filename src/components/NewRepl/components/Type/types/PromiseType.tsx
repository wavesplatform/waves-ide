import React from 'react';
import which from '../which-type';
import { ITypeState } from './ITypeState';
import cn from 'classnames';
import styles from './styles.less';


interface IPromiseTypeProps {
    allowOpen: boolean,
    value: any,
    filter?: any,
}

interface IPromiseTypeState extends ITypeState {
    promiseValue: any,
    status: string
}

export class PromiseType extends React.Component<IPromiseTypeProps, IPromiseTypeState> {

    state = {
        open: false,
        promiseValue: undefined,
        status: 'pending',
    };

    toggle = async (e: React.MouseEvent) => {
        if (!this.props.allowOpen) return;
        e.stopPropagation();
        e.preventDefault();
        const open = !this.state.open;
        if (open) {
            const {promiseValue, status} = await this.updatePromiseState();
            return this.setState({promiseValue, status, open});
        }
        this.setState({open});
    };

    updatePromiseState = async () => {
        let promiseValue;
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
    };

    async componentDidMount() {
        const {promiseValue, status} = await this.updatePromiseState();
        this.setState({promiseValue, status});
    }

    render() {
        const {filter} = this.props;
        const {open, promiseValue, status} = this.state;
        const Value = which(promiseValue);

        return (!open)
            ? (
                <div className={cn(styles.type, styles.closed)}>
                    <em onClick={this.toggle}>Promise</em>
                    {'{ '}
                    <span className={styles.key}>[[PromiseStatus]]:</span>
                    <span>{status}</span>
                    <span className={styles.sep}>, </span>
                    <span className={styles.key}>[[PromiseValue]]:</span>
                    <span onClick={this.toggle}>
                            <Value filter={filter} allowOpen={open} value={promiseValue} shallow={true}/>
                        </span>
                    {' }'}
                </div>
            ) : (
                <div className={styles.type}>
                    <div className={styles.header}>
                        <em onClick={this.toggle}>Promise</em>
                        <span>{'{'}</span>
                    </div>
                    <div className={styles.group}>
                        <div className={styles['key-value']}>
                            <span className={styles.key}>[[PromiseStatus]]:</span>
                            <span>{status}</span>
                        </div>
                        <div className={styles['key-value']}>
                            <span className={styles.key}>[[PromiseValue]]:</span>
                            <span><Value filter={filter} allowOpen={open} value={promiseValue} shallow={true}/></span>
                        </div>
                    </div>
                    <span>{'}'}</span>
                </div>
            );
    }
}
