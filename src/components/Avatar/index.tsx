import * as React from 'react';
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

    const src = address ? createAvatar(address, size * 3) : '';

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

const createAvatar = (seed: string, size: number) => {
    const cells = 8;
    const canvas = document.createElement('canvas');

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return '';
    }

    const blockSize = Math.floor(size / cells);
    const hash = hashSeed(seed);
    const hue = hash % 360;
    const fillColor = `hsl(${hue}, 70%, 45%)`;
    const bgColor = `hsl(${hue}, 35%, 92%)`;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = fillColor;

    for (let y = 0; y < cells; y += 1) {
        for (let x = 0; x < Math.ceil(cells / 2); x += 1) {
            const bitIndex = y * Math.ceil(cells / 2) + x;
            const shouldFill = ((hash >>> (bitIndex % 24)) & 1) === 1;
            if (!shouldFill) {
                continue;
            }

            const mirroredX = cells - x - 1;
            ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
            ctx.fillRect(mirroredX * blockSize, y * blockSize, blockSize, blockSize);
        }
    }

    return canvas.toDataURL();
};

const hashSeed = (seed: string) => {
    let hash = 2166136261;

    for (let i = 0; i < seed.length; i += 1) {
        hash ^= seed.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }

    return hash >>> 0;
};
