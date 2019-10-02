import React from 'react';
import cn from 'classnames';
import styles from './styles.less';

interface IProps {
    value: boolean
}

export const BooleanType = ({value}: IProps) =>
    <div className={cn(styles.bool, styles.type)}>{value ? 'true' : 'false'}</div>;
