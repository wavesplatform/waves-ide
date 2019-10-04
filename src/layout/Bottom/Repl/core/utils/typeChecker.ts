import { TList, TPrimitive, TStruct, TType, TUnion } from '@waves/ride-js';

export const isPrimitive = (item: TType): item is TPrimitive => typeof item === 'string';
export const isStruct = (item: TType): item is TStruct => typeof item === 'object' && 'typeName' in item;
export const isList = (item: TType): item is TList => typeof item === 'object' && 'listOf' in item;
export const isUnion = (item: TType): item is TUnion => Array.isArray(item);

export type TTypeDoc = { name?: string, type: string, link?: string, optional?: boolean };


export const getTypeDoc = (type: TType, level = 0): TTypeDoc[] => {

    const out: TTypeDoc[] = [];
    try {
        if (isPrimitive(type)) {
            out.push({type: type as string});
        } else if (isStruct(type)) {
            type.fields
                .forEach(field => {
                    const doc = getTypeDoc(field.type, level).map(({type}) => type).join(' | ');
                    out.push({name: field.name, type: doc, optional: (field as any).optional});
                });
        } else if (isUnion(type)) {
            out.push({type: type.map(t => getTypeName(t)).join(' | ')});
        } else if (isList(type)) {
            out.push({type: getTypeName(type)});
        }
    } catch (e) {
        console.log(e);
    }

    return out;

};
export const getTypeName = (type: TType): string => {
    try {
        if (isPrimitive(type)) {
            return type;
        } else if (isStruct(type)) {
            return type.typeName;
        } else if (isUnion(type)) {
            return type.map(t => getTypeName(t)).join(' | ');
        } else if (isList(type)) {
            return `${getTypeName(type.listOf)}[]`;
        }
        return 'any';
    } catch (e) {
        console.log(e);
        return 'any';
    }
}
