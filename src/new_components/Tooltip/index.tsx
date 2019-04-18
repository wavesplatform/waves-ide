import * as React from 'react';
import Popover from 'rc-tooltip';
import styles from './styles.less';

interface IProps {
    overlay: JSX.Element
    placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight' | 'top' | 'bottom'
    trigger?: 'hover' | 'click'
    align?: {
        offset?: number[],
        points?: string[],
        targetOffset?: string[],
        overflow?: { adjustX: boolean, adjustY: boolean }
    }
    className?: string
    children?: any
}

const Tooltip = (props: IProps) =>
        <Popover
            className={props.className}
            placement={props.placement}
            trigger={props.trigger}
            align={{offset: [-34, 0]}}
            overlay={<div className={styles.root}>{props.overlay}</div>}
            destroyTooltipOnHide={true}
        >
            {props.children}
        </Popover>
;

export default Tooltip;
