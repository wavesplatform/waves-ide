import React from 'react';
import styles from './styles.less';

interface IProps {
    elements?: React.ReactElement[]
    text: string
}

const Toolbar: React.FC<IProps> = ({elements, text}) => <div className={styles.root}>
    {elements}
    <p className={styles.text}>{text}</p>
</div>;

export default Toolbar;
