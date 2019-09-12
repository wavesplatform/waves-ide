import React from 'react';
import cn from 'classnames';
import styles from '../../Line/styles.less';

interface IStringTypeProps {
    value: string,
    bare?: boolean,
    html?: boolean,
    shallow?: boolean
}

interface IStringTypeState {
    multiline: boolean,
    expanded: boolean
}

export class StringType extends React.Component<IStringTypeProps, IStringTypeState> {
    private string?: HTMLDivElement | null;

    constructor(props: IStringTypeProps) {
        super(props);
        this.state = {
            multiline: props.value.includes('\n'),
            expanded: !props.shallow,
        };
        this.onToggle = this.onToggle.bind(this);
    }

    onToggle(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            expanded: !this.state.expanded,
        });
    }

    render() {
        let {bare = false, html = false, value} = this.props;
        const {multiline, expanded} = this.state;

        if (multiline && !expanded) {
            value = value.replace(/\n/g, '↵');
        }

        const expand = (
            <button onClick={this.onToggle} className={cn(styles.icon, styles.expand)}>
                +
            </button>
        );

        const child = html ? (
            <span dangerouslySetInnerHTML={{__html: value}}/>
        ) : (
            value
        );

        const className = cn([
            styles.type,
            styles.string,
            {
                [styles.toggle]: expanded,
                [styles.bareString]: bare,
                [styles.quote]: !bare,
            },
        ]);

        return (
            <div ref={e => (this.string = e)} className={className}>
                {multiline && expand}
                {child}
            </div>
        );
    }
}
