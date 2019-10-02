import React from 'react';
import { ObjectType } from './ObjectType';
import { ITypeState } from './ITypeState';

interface IErrorTypeProps {
    allowOpen: boolean,
    open: boolean,
    filter: any,
    shallow?: boolean,
    value: { name?: string }
}

export class ErrorType extends React.Component<IErrorTypeProps, ITypeState> {

    state = {
        open: this.props.open,
    };

    render() {
        const {value, shallow = true, filter, allowOpen} = this.props;
        const {open} = this.state;

        const sig = value.name || value.constructor.name;

        return (
            <ObjectType
                filter={filter}
                allowOpen={allowOpen}
                type="error"
                shallow={shallow}
                open={open}
                value={value}
                displayName={sig}
            />
        );
    }
}

