import * as ts from 'typescript';
import { resolve } from 'path';
import * as fs from 'fs';
import { TType, TUnion } from '@waves/ride-js';
import { schemas } from '@waves/tx-json-schemas/';
import { TSeedTypes } from '@waves/waves-transactions';

function getProgramFromFiles(files: string[], jsonCompilerOptions: any = {}, basePath: string = './'): ts.Program {
    const compilerOptions = ts.convertCompilerOptionsFromJson(jsonCompilerOptions, basePath).options;
    const options: ts.CompilerOptions = {
        noEmit: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS,
        allowUnusedLabels: true,
    };
    for (const k in compilerOptions) {
        if (compilerOptions.hasOwnProperty(k)) {
            options[k] = compilerOptions[k];
        }
    }
    return ts.createProgram(files, options);
}


type TResultTypeTip = {
    type: TType
    range: {
        start: number
        end: number
    }
};

export type TArgument = {
    name: string
    type: TType
    typeName?: string
    optional?: boolean
    doc?: string
};

export type TSchemaType = {
    name: string
    resultType: TReturnType[]
    args: TArgument[]
    doc?: string
};

export type TReturnType = {
    val: string,
    tip?: TType;
};

export  type TStructField = { name: string, type: TType, doc?: string, optional?: boolean };

const replFuncs: TSchemaType[] = [
    {
        name: 'help',
        resultType: [],
        args: [{
            name: 'func',
            type: 'string',
            optional: true,
            doc: 'You can use help(functionName) to get info for the specified function.'
        }],
        doc: 'Help for the available API functions\n\nYou can use help() to get list of available functions ' +
            'or help(functionName) to get info for the specified function.',
    },
    {
        name: 'clear',
        resultType: [],
        args: [],
        doc: 'clear console'
    },
    {
        name: 'deploy',
        resultType: [],
        args: [
            {
                name: 'params',
                optional: true,
                type: ({
                    typeName: 'TDeployParams',
                    fields: [
                        {name: 'fee', type: 'number'},
                        {name: 'senderPublicKey', type: 'string'},
                        {name: 'script', type: 'string'},
                    ]
                }),
            },
            {
                name: 'seed',
                optional: true,
                type: 'TSeedTypes',
            },
        ],
        doc: 'Compile currently selected contract and deploy it to default account'
    }
];

const buildSchemas = () => {

    const out: TSchemaType [] = replFuncs;

    const path = 'node_modules/@waves/js-test-env/dist/augmentedGlobal.d.ts';
    const program = getProgramFromFiles([resolve(path)]);
    const tc = program.getTypeChecker();
    program.getSourceFiles().forEach((sourceFile) => {

        if (!sourceFile.fileName.includes(path)) return;

        function inspect(node: ts.Node) {
            if (ts.isFunctionDeclaration(node)) {
                const signature = tc.getSignatureFromDeclaration(node);
                const returnTypeObject = signature && tc.getReturnTypeOfSignature(signature);
                let returnType = 'Unknown';
                const returnTypeTips: TResultTypeTip[] = [];

                if (returnTypeObject) {
                    //replace '<string | number>'
                    returnType = tc.typeToString(returnTypeObject).replace(/<string \| number>/g, '');
                    Object.keys(schemas).forEach(type =>
                        returnType.includes(type) && returnTypeTips.push({
                            range: {start: returnType.search(type), end: returnType.search(type) + type.length - 1},
                            type: getTypeByName(type)
                        })
                    );
                }
                out.push({
                    name: node.name ? node.name.escapedText.toString() : 'Unknown',
                    args: node.parameters.map((p: ts.ParameterDeclaration) => (
                        {
                            name: ts.isIdentifier(p.name) ? p.name.escapedText.toString() : 'Unknown',
                            type: getArgumentType(p),
                            typeName: p.type && p.type.getText(),
                            optional: tc.isOptionalParameter(p),
                            doc: ts.getJSDocType(p) !== undefined ? ts.getJSDocType(p)!.toString() : ''
                        }
                    )),
                    resultType: getReturnType(returnType, returnTypeTips),
                    doc: ((node as any).jsDoc || []).map(({comment}: any) => comment).join('\n')
                });
            } else {
                ts.forEachChild(node, n => inspect(n));
            }
        }

        inspect(sourceFile);
    });
    return out;
};

function getReturnType(type: string, tips: TResultTypeTip[]): TReturnType[] {
    let typeOut: TReturnType[] = [];
    const sortedTips = tips.sort((a, b) => (a.range.start > b.range.start) ? 1 : -1);
    sortedTips.forEach((tip, i) => {
        if (tip.range.start !== 0 && i === 0) {
            typeOut.push({val: type.slice(0, tip.range.start)});
        }
        typeOut.push({val: type.slice(tip.range.start, tip.range.end + 1), tip: tip.type});
        if (i === sortedTips.length - 1) {
            if (tip.range.end < type.length - 1) {
                typeOut.push({val: type.slice(tip.range.end + 1, type.length)});
            }
        } else {
            typeOut.push({val: type.slice(tip.range.end + 1, sortedTips[i + 1].range.start)});
        }
    });
    return typeOut;
}

const getArgumentType = (p: ts.ParameterDeclaration): TType => {

    if (!p.type) return 'Unknown';
    const split = p.type.getText().split('|');
    if (split.length === 1) {
        return getTypeByName(split[0].replace(' ', ''));
    } else {
        return (split.map((item): TType => getTypeByName(item.replace(' ', ''))) as TUnion);
    }

};

const getTypeByName = (name: string): TType => {
    const schema = (schemas as any)[name];
    function defineType(typeObject: any, name?: string): TType {

        //array
        if (typeObject.type === 'array') return {'listOf': defineType(typeObject.items)};


        //union
        if (Array.isArray(typeObject.type)) return typeObject.type.map((item: any) => defineType(item));

        if (Array.isArray(typeObject.anyOf)) return typeObject.anyOf.map((item: any) => defineType(item));


        //structure
        if (typeObject.type === 'object') {
            if (typeObject.patternProperties) {
                return {
                    typeName: typeObject.type,
                    fields: [{name: '[key:number]', type: defineType(typeObject.patternProperties['^[0-9]+$'])}]
                };
            } else {
                return {
                    typeName: name || typeObject.type,
                    fields: Object.keys(typeObject.properties).map((prop): TStructField => ({
                            name: prop,
                            type: defineType(typeObject.properties[prop], name),
                            optional: !(typeObject.required && typeObject.required.includes(prop))
                        })
                    )
                };
            }
        }

        //reference
        if (typeObject.$ref) {
            const split = typeObject.$ref.split('/').pop();
            return defineType(schema.definitions[split], split);
        }

        //enum
        if (typeObject.enum) return typeObject.enum.join('|');

        //primitive
        if (typeof typeObject === 'string') return typeObject;

        //else
        return typeObject.type;
    }


    return schema ? defineType(schema, name) : name;
};





const filePath = './src/schemas/envFunctions.json';


const out = JSON.stringify(buildSchemas(), null, 4);
try {
    fs.unlinkSync(filePath);
} catch (e) {
}
fs.appendFile(filePath, (out), function (err) {
    if (err) throw err;
    console.log('✅ -> Schemas were saved to ' + filePath);
});
