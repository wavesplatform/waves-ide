import React from 'react';
import { ObjectType } from './ObjectType';
import { ITypeState } from './ITypeState';

interface IFunctionTypeProps {
    allowOpen: boolean,
    shallow?: boolean,
    value: any
}

export class FunctionType extends React.Component<IFunctionTypeProps, ITypeState> {

    state = {
        open: false,
    };

    render() {
        const {value, shallow = true, allowOpen} = this.props;
        const {open} = this.state;

        // this gets the source of the function, regadless of whether
        // it has a function called ".toString", like lodash has!
        const code = Function.toString.call(value);

        // const native = code.indexOf('[native code') !== -1;
        let sig = code.substring(0, code.indexOf('{')).trim().replace(/\s/g, ' ');

        if (!sig) {
            // didn't match because it's an arrow func
            sig = code.substring(0, code.indexOf('=>')).trim() + ' =>';
        }

        sig = sig.replace(/^function/, 'ƒ');

        if (value.hasOwnProperty('toString')) {
            sig = `ƒ ${value.toString()}`;
        }

        const object = Object.getOwnPropertyNames(value).reduce((acc: any, curr: string) => {
            acc[curr] = value[curr];
            return acc;
        }, {});

        return (
            <ObjectType
                allowOpen={allowOpen}
                type="function"
                shallow={shallow}
                value={object}
                displayName={sig}
            />
        );
    }
}

