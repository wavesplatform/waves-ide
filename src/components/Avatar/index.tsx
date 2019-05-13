import * as React from 'react';
import * as avatar from 'identity-img';
import cn from 'classnames';

import styles from './styles.less';

const SIZE = 67;

interface IProps {
    size?: number,
    address: string,
    className?: string,
    onClick?: () => void
}

const Avatar = (props: IProps) => {
    const {
        size = SIZE,
        address,
        className,
        onClick
    } = props;

    avatar.config({
        rows: 8,
        cells: 8
    });

    const src = address
        ? avatar.create(address, { size: size * 3 })
        : '';

    return (
        <div
            className={cn(styles.avatar, className)}
            onClick={onClick}
        >
            <img
                src={src}
                width={size}
                height={size}
                alt="Avatar"
            />
        </div>
    );
};

export default Avatar;
