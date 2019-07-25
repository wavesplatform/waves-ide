import * as React from 'react';
import { LineNav } from './LineNav';
import which from '../lib/which-type';
import Help from './Help';

export class Line extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            filter: null,
        };
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        return this.state.filter !== nextState.filter;
    }

    render() {
        const {
            type = 'response',
            value,
            command = null,
            error = false,
            open = false,
            html = false,
            onFocus = () => {
            },
        } = this.props;

        let line = null;

        const {filter} = this.state;

        if (type === 'command') {
            line = (
                <div className="prompt input">
                    <LineNav value={value}/>
                    {value}
                </div>
            );
        }

        if (this.props.type === 'help') return <Help className={'Line'} signatures={value}/>;


        if (type === 'log' || type === 'response') {
            if (type === 'log' && Array.isArray(value) && value.length === 0) {
                return null;
            }


            // for LineNav I do a bit of a giggle so if it's a log, we copy the single
            // value, which is nicer for the user
            line = (
                <div className={`prompt output ${type} ${error ? 'error' : ''}`}>
                    <LineNav
                        onFilter={(filter: any) => {
                            this.setState({filter});
                        }}
                        value={
                            type === 'log' && Array.isArray(value) && value.length === 1
                                ? value[0]
                                : value
                        }
                        command={command}
                    />

                    {(type === 'log' && Array.isArray(value) ? value : [value]).map(
                        (value, i) => {
                            if (value) {
                                try {
                                    const valueType = ({}).toString.call(value);
                                    if (valueType === '[object Object]') {
                                        value = Object.assign({}, value);
                                    }
                                } catch (e) { // only happens when typeof is protected (...randomly)
                                }
                            }
                            const Type = which(value);
                            return (
                                <Type
                                    filter={filter}
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
                </div>
            );
        }

        return (
            <div className="Line" onClick={onFocus}>
                {line}
            </div>
        );
    }
}
