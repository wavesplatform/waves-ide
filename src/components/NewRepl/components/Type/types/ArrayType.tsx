import React from 'react';
import { flatten, zip } from 'lodash';
import which from '../which-type';
import { ITypeState } from './ITypeState';
import cn from 'classnames';
import styles from '../../Line/styles.less';

interface IArrayTypeProps {
    allowOpen: boolean,
    open: boolean,
    value: Array<any>,
    shallow?: boolean,
    filter?: any
}

export class ArrayType extends React.Component<IArrayTypeProps, ITypeState> {

    constructor(props: IArrayTypeProps) {
        super(props);
        this.toggle = this.toggle.bind(this);

        this.state = {
            open: props.open,
        };
    }

    toggle(e: React.MouseEvent) {
        if (!this.props.allowOpen) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
        this.setState({open: !this.state.open});
    }

    render() {
        const {value, shallow = true, filter = null} = this.props;
        const {open} = this.state;

        let length = value.length;

        if (shallow && !open) {
            return (
                <div className={cn(styles.type, styles.ArrayType, styles.closed)} onClick={this.toggle}>
                    <em>Array</em>
                    <span className={styles.arbInfo}>({length})</span>
                </div>
            );
        }

        let types = value.slice(0, open ? value.length : 10).map((_: string, i: number) => {
            const Type = which(_);
            return (
                <Type
                    allowOpen={open}
                    key={`arrayType-${i + 1}`}
                    shallow={true}
                    value={_}
                >
                    {_}
                </Type>
            );
        });

        // expose holes in the collapsed mode
        if (!open) {
            let count = 0;
            const newTypes = [];
            for (let i = 0; i < types.length; i++) {
                const hole = !(i in types);

                if (count !== 0 && !hole) {
                    newTypes.push(
                        <span key={`hole-${i}`} className={styles.arbInfo}>
              &lt;undefined × {count}&gt;
            </span>
                    );
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
                newTypes.push(
                    <span key={`hole-${types.length}`} className={styles.arbInfo}>
            &lt;undefined × {count}&gt;
          </span>
                );
            }

            types = newTypes;
        }

        if (!open && value.length > 10) {
            types.push(
                <span key="arrayType-0" className={styles.arbInfo}>
          …
        </span>
            );
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
                    <span className={styles.arbInfo}>({length})</span>[ {types} ]
                </div>
            );
        }

        // this is the full output view
        return (
            <div className={cn(styles.type, styles.ArrayType)}>
                <div onClick={this.toggle} className={styles.header}>
                    <em>Array</em>
                    <span className={styles.arbInfo}>({length})</span>[
                </div>
                <div className={styles.group}>
                    {types.map((type: any, i: number) => {
                        if (
                            filter === null ||
                            filter === undefined ||
                            filter === '' ||
                            (value[i] + '').toLowerCase().includes(filter)
                        ) {
                            return (
                                <div className={styles['key-value']} key={`subtype-${i}`}>
                                    <span className={styles.index}>{i}:</span>
                                    {type}
                                </div>
                            );
                        }

                        return null;
                    })}
                </div>
                ]
            </div>
        );
    }
}

