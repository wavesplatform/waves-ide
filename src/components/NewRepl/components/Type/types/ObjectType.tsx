import React from 'react';
import which from '../which-type';
import { StringType } from './StringType';
import flatten from '@utils/flatten';
import zip from '@utils/zip';
import { ITypeState } from './ITypeState';
import cn from 'classnames';
import styles from './styles.less';

const LIMIT_CLOSED = 5;

function* enumerate(obj: any) {
    let visited = new Set();
    while (obj) {
        for (let key of Reflect.ownKeys(obj)) {
            if (typeof key === 'string') {
                let desc = Reflect.getOwnPropertyDescriptor(obj, key);
                if (desc && !visited.has(key)) {
                    visited.add(key);
                    if (desc.enumerable) {
                        yield key;
                    }
                }
            }
        }
        obj = Reflect.getPrototypeOf(obj);
    }
}

interface IObjectTypeProps {
    allowOpen: boolean,
    shallow?: boolean,
    value: any,
    filter?: any,
    displayName: string,
    name?: string,
    type?: string
}

export class ObjectType extends React.Component<IObjectTypeProps, ITypeState> {

    state = {
        open: false,
    };

    shouldComponentUpdate(nextProps: IObjectTypeProps, nextState: ITypeState) {
        switch (true) {
            case (this.state.open !== nextState.open):
                return true;
            case (this.props.filter === undefined):
                return false; // this prevents bananas amount of rendering
            case (this.props.filter === nextProps.filter):
                return false;
            default:
                return true;
        }
    }

    toggle = (e: React.MouseEvent) => {
        if (!this.props.allowOpen) return;
        e.stopPropagation();
        e.preventDefault();
        this.setState({open: !this.state.open});
    };

    render() {
        const {open} = this.state;
        const {filter = null, value, shallow = true, type = {}.toString.call(value)} = this.props;
        let {displayName} = this.props;

        if (!displayName) {
            displayName = value.constructor ? value.constructor.name : 'Object';
        }

        if (!open && shallow) {
            return (<div onClick={this.toggle} className={cn(styles.type, styles[type])}><em>{displayName}</em></div>);
        }

        let props = open ? [...enumerate(value)] : Object.keys(value);

        Object.getOwnPropertyNames(value).forEach(prop => (!props.includes(prop)) && props.push(prop));

        if (filter !== null) {
            props = props.filter(prop => {
                switch (true) {
                    case ((prop + '').toLowerCase().includes(filter)):
                        return true;
                    case ((value[prop] + '').toLowerCase().includes(filter)):
                        return true;
                    default :
                        return false;
                }
            });
        }

        if (!open) {
            props.splice(LIMIT_CLOSED);
        }

        let types = props.sort().map((key, i) => {
            const Type = which(value[key]);
            return {
                key,
                value: (
                    <Type
                        allowOpen={open}
                        key={`objectType-${i + 1}`}
                        shallow={true}
                        value={value[key]}
                    />
                ),
            };
        });

        if (!open && Object.keys(value).length > LIMIT_CLOSED) {
            types.push(<span key="objectType-0">…</span> as any);
        }

        if (!open) {
            if (type === 'error') {
                return (
                    <div className={cn(styles.type, styles[type])}>
                        <em onClick={this.toggle}>{displayName}</em>
                        <span>{'{'} <StringType value={value.message}/> {'}'}</span>
                    </div>
                );
            }
            if (displayName !== 'Object') {
                // just show the summary
                return (
                    <div className={cn(styles.type, styles[type])}>
                        <em onClick={this.toggle}>{displayName}</em>
                        <span>{'{ … }'}</span>
                    </div>
                );
            }

            // intersperce with commas
            types = flatten(
                zip(
                    types,
                    Array.from(
                        {length: types.length - 1},
                        (n, i) => (<span key={`sep-${i}`} className={styles.sep}>,</span> as any)
                    )
                )
            );

            // do mini output
            return (
                <div className={cn(styles.type, styles.object, styles.closed)} onClick={this.toggle}>
                    <em>{displayName}</em>
                    <span>{'{'} </span>
                    {types.map((obj, i) => (obj && obj.key && obj.value)
                        ? <span className={styles['key-value']} key={`subtype-${i}`}>
                  <span className={styles.key}>{obj.key}:</span>
                  <span>{obj.value}</span>
                </span>
                        : obj
                    )}
                    <span> {'}'}</span>
                </div>
            );

        }

        return (
            <div className={cn(styles.type, styles[type], {[styles.closed]: !open})}>
                <div className={styles.header}>
                    <em onClick={this.toggle}>{displayName}</em>
                    <span>{'{'}</span>
                </div>
                <div className={styles.group}>
                    {types.map((obj, i) =>
                        <div className={styles['key-value']} key={`subtype-${i}`}>
                            <span className={styles.key}>{obj.key}:</span>
                            <span>{obj.value}</span>
                        </div>
                    )}
                </div>
                <span>{'}'}</span>
            </div>
        );
    }
}
