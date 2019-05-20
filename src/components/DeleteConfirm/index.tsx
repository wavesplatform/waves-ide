import React, { createRef } from 'react';
import Tooltip from '@src/components/Tooltip';
import Button from '@src/components/Button';
import styles from './styles.less';

interface IProps {
    children: JSX.Element
    name: string
    type: string
    onDelete: (e: React.MouseEvent) => void
    owner?: string
    align?: {
        offset?: number[],
        points?: string[],
        targetOffset?: string[],
        overflow?: { adjustX: boolean, adjustY: boolean }
    }
}

export default class DeleteConfirm extends React.Component<IProps> {
    tooltipRef = createRef<any>();

    handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        this.tooltipRef.current.trigger.setState({popupVisible: false});
    };

    handleDelete = (e: React.MouseEvent) => {
        this.props.onDelete(e);
        this.handleClose(e);
    };

    overlay = <div className={styles.root} data-owner={this.props.owner}>
        <div className={styles.bold}>{`Delete this ${this.props.type}?`}</div>
        <div className={styles.caption}>Are you sure you want to</div>
        <div className={styles.text}>{'permenantly delete '}
            <div className={styles.name}>{this.props.name}</div>
            <div className={styles.caption}>?</div>
        </div>
        <div className={styles.buttonSet}>
            <Button className={styles.btn} onClick={this.handleClose}>Cancel</Button>
            <Button className={styles.btn} type="action-blue" onClick={this.handleDelete}>Yes, delete it</Button>
        </div>
    </div>;

    render() {
        const {children, align, ...other} = this.props;
        return <Tooltip {...other}
                        align={align}
                        ref={this.tooltipRef}
                        placement="bottomLeft"
                        overlay={this.overlay}
                        trigger="click"
        >
            {children}
        </Tooltip>;
    }
}

