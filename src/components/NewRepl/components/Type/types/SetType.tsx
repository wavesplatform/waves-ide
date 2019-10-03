import React from 'react';
import { EntryType as Entry } from './EntryType';
import { ITypeState } from './ITypeState';
import flatten from '@utils/flatten';
import zip from '@utils/zip';
import cn from 'classnames';
import styles from './styles.less';

interface ISetTypeProps {
    allowOpen: boolean,
    value: Set<any>,
    shallow?: boolean,
    displayName?: string
}

export class SetType extends React.Component<ISetTypeProps, ITypeState> {

    state = {
        open: false,
    };

    toggle = (e: React.MouseEvent) => {
        if (!this.props.allowOpen) return;
        e.stopPropagation();
        e.preventDefault();
        this.setState({open: !this.state.open});
    };

    render() {
        const {value, shallow = true} = this.props;
        const {open} = this.state;
        let {displayName} = this.props;

        if (!displayName) {
            displayName = value.constructor ? value.constructor.name : 'Object';
        }

        let length = value.size;

        if (shallow && !open) {
            return (
                <div className={cn(styles.type, styles.ArrayType, styles.closed)} onClick={this.toggle}>
                    <em>{displayName}</em><span>({length})</span>
                </div>
            );
        }

        let types = [];
        let i = 0;

        for (let entry of value.entries()) {
            types.push(
                <Entry
                    key={`setTypeKey-${i + 1}`}
                    shallow={true}
                    value={entry}
                    allowOpen={open}
                />
            );
            i++;
            if (!open && i === 10) {
                break;
            }
        }

        if (!open && length > 10) {
            types.push(<span key="setTypeMore-0" className={styles.arbInfo}>…</span>);
        }

        if (!open) {
            // intersperce with commas
            types = flatten(
                zip(
                    types,
                    Array.from({length: length - 1}, (n, i) => (
                        <span key={`sep-${i}`} className={styles.sep}>,</span>
                    ))
                )
            );
            // do mini output
            return (
                <div className={cn(styles.type, styles.closed)} onClick={this.toggle}>
                    <em>{displayName}</em>
                    <span className={styles.arbInfo}>({length})</span>
                    <span> {'{'} </span>{types}<span> {'}'}</span>
                </div>
            );
        }

        return (
            <div className={styles.type} onClick={this.toggle}>
                <em>{displayName}</em>
                <span className={styles.arbInfo}>({length})</span>
                <span> {'{'} </span>
                <div className={styles.group}>
                    <span className={styles.arbInfo}>[[Entries]]:</span>
                    {types.map((type, i) =>
                        <div className={styles['key-value']} key={`subtype-${i}`}>
                            <span className={styles.index}>{i}:</span>
                            {type}
                        </div>
                    )}
                </div>
                <span> {'}'}</span>
            </div>
        );
    }
}
