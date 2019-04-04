import * as React from 'react';
import styles from './avatar.less';
import * as avatar from 'identity-img';
import cn from 'classnames';

const SIZE = 67;
const TYPE = 'seed';

export class Avatar extends React.Component
    <{ size?: number, address: string, type?: string, className?: string, selected?: boolean, onClick?: any }> {

    state: { address?: string, src?: string } = {};

    static getDerivedStateFromProps(nextProps: any, prevState: any) {
        const {address, size = SIZE} = nextProps;

        if (prevState.address !== address) {
            avatar.config({rows: 8, cells: 8});
            const src = address ? avatar.create(address, {size: size * 3}) : '';
            return {address, src};
        }

        return {};
    }

    render() {
        const {size = SIZE, type = TYPE, className, onClick} = this.props;
        const myClassName = cn(styles[type], styles.avatar, className, {[styles.selected]: this.props.selected});
        const style = {
            width: `${size}px`,
            height: `${size}px`,
        };

        return <div className={myClassName} style={style} onClick={onClick}>
            <img src={this.state.src} width={size} height={size} style={style} alt="Avatar"/>
        </div>;
    }
}
