import React from 'react';
import Tooltip from '@src/new_components/Tooltip';
import Button from '@src/new_components/Button';
import styles from './styles.less';

interface IProps {
    children: JSX.Element
    name: string
    onDelete: () => void
}

export default class DeleteConfirm extends React.Component<IProps> {

    overlay = <div className={styles.root}>
        <div className={styles.bold}>Delete this account?</div>
        <div>Are you sure you want to</div>
        <div className={styles.text}>{'permenantly delete '}
            <div className={styles.name}>{this.props.name}</div>
        </div>
        <div className={styles.buttonSet}>
            <Button className={styles.btn}>Cancel</Button>
            <Button className={styles.btn} type="action-blue" onClick={this.props.onDelete}>Yes, delete it</Button>
        </div>
    </div>;

    render() {
        const {children} = this.props;
        return <Tooltip placement="bottomLeft"  overlay={this.overlay} trigger="click">
            {children}
        </Tooltip>;
    }
}
