import React from 'react';
import Tooltip from '@src/new_components/Tooltip';
import Button from '@src/new_components/Button';
import styles from './styles.less'

interface IProps {
    children: JSX.Element
    name: string
    onDelete: () => void
}

export default class DeleteConfirm extends React.Component<IProps> {

    overlay = <div className={styles.root}>
        <div className={styles.bold}>Delete this account?</div>
        <div>
            <div>Are you sure you want to</div>
            <div className={styles.text}>permenantly delete</div>
            <div className={styles.name}>{this.props.name}</div>
        </div>
        <div>
            <Button>Cancel</Button>
            <Button type="action-blue" onClick={this.props.onDelete}>Add</Button>
        </div>
    </div>;

    render() {
        const {children} = this.props;
        return <Tooltip placement="bottomLeft" align={{offset: [-34, 0]}} overlay={this.overlay} trigger="click">
            {children}
        </Tooltip>;
    }
}
