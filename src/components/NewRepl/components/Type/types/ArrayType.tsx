import React from 'react';
import flatten from '../../../utils/flatten';
import zip from '../../../utils/zip';
import which from '../which-type';
import { ITypeState } from './ITypeState';
import cn from 'classnames';
import styles from './styles.less';

interface IArrayTypeProps {
    allowOpen: boolean,
    open: boolean,
    value: Array<any>,
    shallow?: boolean,
    filter?: any
}

export class ArrayType extends React.Component<IArrayTypeProps, ITypeState> {

    state = {
        open: this.props.open,
    };

    toggle = (e: React.MouseEvent) => {
        if (!this.props.allowOpen) return;
        e.stopPropagation();
        e.preventDefault();
        this.setState({open: !this.state.open});
    };

    render() {
        const {value, shallow = true, filter = null} = this.props;
        const {open} = this.state;
        let length = value.length;

        if (shallow && !open) {
            return (
                <div className={cn(styles.type, styles.ArrayType, styles.closed)} onClick={this.toggle}>
                    <em>Array</em>
                    <span>({length})</span>
                </div>
            );
        }

        let types = value.slice(0, open ? value.length : 10).map((_: string, i: number) => {
            const Type = which(_);
            return <Type allowOpen={open} key={`arrayType-${i + 1}`} shallow={true} value={_}>{_}</Type>;
        });

        // expose holes in the collapsed mode
        if (!open) {
            let count = 0;
            const newTypes = [];
            for (let i = 0; i < types.length; i++) {
                const hole = !(i in types);

                if (count !== 0 && !hole) {
                    newTypes.push(<span key={`hole-${i}`}>&lt;undefined × {count}&gt;</span>);
                    count = 0;
                } else if (hole) {
                    count++;
                }

                if (!hole) {
                    newTypes.push(types[i]);
                }
            }

            // if there are holes at the end
            if (count !== 0) {
                newTypes.push(<span key={`hole-${types.length}`}>&lt;undefined × {count}&gt;</span>);
            }

            types = newTypes;
        }

        if (!open && value.length > 10) {
            types.push(<span key="arrayType-0">…</span>);
        }

        if (!open) {
            // intersperce with commas
            types = flatten(
                zip(types,
                    Array.from({length: types.length - 1},
                        (n, i) => (<span key={`sep-${i}`} className={styles.sep}>,</span>)
                    )
                )
            ) as JSX.Element[];

            // do mini output
            return (
                <div className={cn(styles.type, styles.ArrayType, styles.closed)} onClick={this.toggle}>
                    <em>Array</em>
                    <span>({length})</span>[ {types} ]
                </div>
            );
        }

        // this is the full output view
        return (
            <div className={cn(styles.type, styles.ArrayType)}>
                <div onClick={this.toggle} className={styles.header}>
                    <em>Array</em>
                    <span>({length})</span>[
                </div>
                <div className={styles.group}>
                    {types.map((type: any, i: number) =>
                        (filter == null || filter === '' || (value[i] + '').toLowerCase().includes(filter))
                            ? (
                                <div className={styles.keyValue} key={`subtype-${i}`}>
                                    <span className={styles.index}>{i}:</span>{type}
                                </div>
                            ) : null
                    )}
                </div>
                ]
            </div>
        );
    }
}

