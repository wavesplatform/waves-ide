import { ArrayType } from './types/ArrayType';
import { ObjectType } from './types/ObjectType';
import { FunctionType } from './types/FunctionType';
import { ErrorType } from './types/ErrorType';
import { NullType } from './types/NullType';
import { UndefinedType } from './types/UndefinedType';
import { NumberType } from './types/NumberType';
import { StringType } from './types/StringType';
import { BooleanType } from './types/BooleanType';
import { SetType } from './types/SetType';
import { PromiseType } from './types/PromiseType';
import React from 'react';

function whichType(value: any): React.ComponentClass<any> {
    let type = '[object Object]';
    try {
        type = ({}).toString.call(value);
    } catch (e) { // only happens when typeof is protected (...randomly)
    }

    if (type === '[object String]') return StringType;
    if (type === '[object Number]') return NumberType;
    if (type === '[object Boolean]') return BooleanType;
    if (type === '[object Set]' || type === '[object Map]') return SetType;
    if (type === '[object Promise]') return PromiseType;
    if (value instanceof Error || type === '[object Error]') return ErrorType;
    if (value === undefined) return UndefinedType;
    if (value === null) return NullType;
    if (type === '[object Array]') return ArrayType;
    if (type === '[object Function]') return FunctionType;

    return ObjectType;
}

export default whichType;
