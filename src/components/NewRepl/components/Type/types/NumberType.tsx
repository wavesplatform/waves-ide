import React from 'react';
import cn from 'classnames';
import styles from './styles.less';

interface INumberTypeProps {
    [propName: string]: any
}

export const NumberType = ({value}: INumberTypeProps) =>
    <div className={cn(styles.type, styles.number)}> {value} </div>;

