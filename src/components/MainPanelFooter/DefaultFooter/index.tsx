import React from 'react';
import classNames from 'classnames';

import styles from '../styles.less';

interface IProps {
    className?: string
}

const DefaultFooter = (props: IProps) => {
    const rootClassName = classNames(styles!.root, props.className);

    return (
        <footer className={rootClassName}/>
    );
};

export default DefaultFooter;
