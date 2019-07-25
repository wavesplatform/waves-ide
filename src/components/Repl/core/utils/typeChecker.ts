import { TList, TPrimitive, TStruct, TType, TUnion } from '@waves/ride-js';

export const isPrimitive = (item: TType): item is TPrimitive => typeof item === 'string';
export const isStruct = (item: TType): item is TStruct => typeof item === 'object' && 'typeName' in item;
export const isList = (item: TType): item is TList => typeof item === 'object' && 'listOf' in item;
export const isUnion = (item: TType): item is TUnion => Array.isArray(item);

export const getTypeDoc = (name: string, type: TType, level = 0): string => {
    let typeDoc = 'any';

    try {
        switch (true) {
            case isPrimitive(type):
                typeDoc = type as string;
                break;
            case isStruct(type):
                typeDoc = `${name} {\n ` + (type as TStruct).fields
                    .map((v) => `${v.name}: ${getTypeDoc(v.name, v.type, level + 1)}`)
                    .join(',\n ') + `\n} ${level > 0 ? '' : '\n'}`;
                break;
            case isUnion(type):

                if (name === 'TTx') {
                    typeDoc = (type as TUnion).map(field => isStruct(field) ? field.typeName : field).join('\n');
                    break;
                }
                const split = name && name.split('|').map(x => x.trim());
                //if(split.length > 1)                debugger
                const typeDocArray = (type as TUnion).map((field, i) => isStruct(field)
                    ? getTypeDoc(field.typeName, field, level + 1)
                    : getTypeDoc(split && split.length > 1 ? split[i] : '', field, level + 1)
                );
                typeDoc = typeDocArray.join(level > 1 ? ' | ' : '\n');
                break;
            case isList(type):
                typeDoc = ` ${getTypeDoc('', (type as TList).listOf, level + 1)}[]`;
                break;
        }
    } catch (e) {
        console.log(e);
    }
    return typeDoc
        .replace(/<string \| number>/g, '')
        .replace(/<LONG>/g, '');
};
