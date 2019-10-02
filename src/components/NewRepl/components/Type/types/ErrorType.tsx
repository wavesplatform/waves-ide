import React from 'react';
import { ObjectType } from './ObjectType';
import { ITypeState } from './ITypeState';

interface IErrorTypeProps {
    allowOpen: boolean,
    filter: any,
    shallow?: boolean,
    value: { name?: string }
}

export class ErrorType extends React.Component<IErrorTypeProps, ITypeState> {

    state = {
        open: false,
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
                value={value}
                displayName={sig}
            />
        );
    }
}

