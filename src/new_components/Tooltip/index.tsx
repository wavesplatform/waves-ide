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
    ref?: any
}

const Tooltip = React.forwardRef((props: IProps, ref) => {
    const {children, overlay, ...other} = props;
    return <Popover
        overlay={<div className={styles.root}>{overlay}</div>}
        destroyTooltipOnHide={true}
        ref={ref}
        {...other}
    >
        {children}
    </Popover>;
});

export default Tooltip;
