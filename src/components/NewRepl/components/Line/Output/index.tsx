import React from 'react';
import { LineMenu } from '@components/NewRepl/components/Line/LineMenu';
import which from '@components/NewRepl/components/Type/which-type';
import cn from 'classnames';
import styles from '../styles.less';

interface IProps {
    type: string
    value: any;
    error?: boolean;
    html?: boolean
    open?: boolean
}

export default class Output extends React.Component<IProps> {

    render() {
        const {type, value, open = false, html = false, error = false} = this.props;

        if (Array.isArray(value) && value.length === 0) {
            return null;
        }

        return <div className={cn(styles.prompt, styles.output, error && styles.error)}>
            <LineMenu value={value}/>

            {(type === 'log' && Array.isArray(value) ? value : [value]).map(
                (value, i) => {
                    if (value) {
                        try {
                            const valueType = ({}).toString.call(value);
                            if (valueType === '[object Object]') {
                                value = Object.assign({}, value);
                            }
                        } catch (e) {
                        }
                    }
                    const Type = which(value);
                    return (
                        <Type
                            html={html}
                            value={value}
                            open={open}
                            allowOpen={true}
                            bare={type === 'log'}
                            key={`type-${i}`}
                            shallow={false}
                        >
                            {value}
                        </Type>
                    );
                }
            )}
        </div>;
    }

}
