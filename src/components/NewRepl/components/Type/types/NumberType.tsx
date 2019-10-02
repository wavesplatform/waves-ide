import React from 'react';
import cn from 'classnames';
import styles from './styles.less';

interface INumberTypeProps {
    [propName: string]: any
}


export class NumberType extends React.Component<INumberTypeProps> {

    render() {
        return <div className={cn(styles.type, styles.number)}> {this.props.value} </div>;
    }
}
