import * as React from 'react';
import { Filter } from './Filter';
import { copyText } from '@utils/copyText';

export class LineNav extends React.Component<any, any> {
    private filter?: Filter | null;

    constructor(props: any) {
        super(props);
        this.preCopy = this.preCopy.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);

        const type = {}.toString.call(props.value) || 'string';
        this.state = {
            text: null,
            type,
            filter: false,
            copyAsHTML: type.includes('Element'),
        };
    }

    async preCopy() {
        // work out how we should copy this thing
        const original = this.props.value;
        let {value, type} = this.props;

        if (this.state.copyAsHTML) {
            const text = value.outerHTML;
            this.setState({text});
            return text;
        }

        if (typeof value === 'function') {
            const text = value.toString();
            this.setState({text});
            return text;
        }

        if (typeof value === 'string') {
            this.setState({text: value});
            return value;
        }

        if (type === '[object Promise]') {
            const text = await value;
            this.setState({text});
            return text;
        }

        if (value instanceof Error || type === '[object Error]') {
            // get real props and add the stack no matter what (FF excludes it)
            value = Object.getOwnPropertyNames(value).reduce((acc: any, curr) => {
                acc[curr] = value[curr];
                return acc;
            }, {});

            value.stack = original.stack;
        }

        const text = JSON.stringify(value, '' as any, 2);
        this.setState({text});
        return text;
    }

    handleCopy = async () => {
        let { text } = this.state;

        if (text === null) {
            text = await this.preCopy();
        }

        if (typeof text === 'string') {
            await copyText(text);
        }
    };

    toggleFilter(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        const filter = !this.state.filter;
        this.setState({
            filter,
        });
    }

    render() {
        const {value, onFilter} = this.props;
        const {text, filter, copyAsHTML} = this.state;

        const copyAs =
            typeof value === 'function'
                ? 'Copy function'
                : copyAsHTML ? 'Copy as HTML' : 'Copy as JSON';

        return (
            <div className="LineNav">
                {typeof value === 'object' &&
                <Filter
                    ref={e => {
                        this.filter = e;
                    }}
                    onFilter={onFilter}
                    enabled={filter}
                >
                    <button onClick={this.toggleFilter} className="icon search">
                        search
                    </button>
                </Filter>}
                <button
                    title={copyAs}
                    className="icon copy"
                    onClick={this.handleCopy}
                >
                    copy
                </button>
            </div>
        );
    }
}
