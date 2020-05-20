import monaco, { languages } from 'monaco-editor/esm/vs/editor/editor.api';
import { Suggestions } from '@waves/ride-language-server/suggestions';
import testTypings from './json-data/test-typings.json';
import rideLanguageService from '@services/rideLanguageService';
import ModuleKind = languages.typescript.ModuleKind;

const suggestions = new Suggestions();
suggestions.updateSuggestions(3);
const transactionClasses = suggestions.types.find(({name}) => name === 'Transaction')!.type;

export const LANGUAGE_ID = 'ride';
export const DEFAULT_THEME_ID = 'wavesDefaultTheme';
export const DARK_THEME_ID = 'wavesDarkTheme';

export default function setupMonaco() {
    // Since packaging is done by you, you need
// to instruct the editor how you named the
// bundles that contain the web workers.
    (self as any).MonacoEnvironment = {
        getWorkerUrl: function (moduleId: any, label: any) {
            if (label === 'json') {
                return './json.worker.bundle.js';
            }
            if (label === 'css') {
                return './css.worker.bundle.js';
            }
            if (label === 'html') {
                return './html.worker.bundle.js';
            }
            if (label === 'typescript' || label === 'javascript') {
                return './ts.worker.bundle.js';
            }
            return './editor.worker.bundle.js';
        }
    };


    // setup ride language

    monaco.languages.register({
        id: LANGUAGE_ID,
    });
    const keywords = ['let', 'true', 'false', 'if', 'then', 'else', 'match', 'case', 'base58', 'base64', 'base16', 'func'];
    const language = {
        tokenPostfix: '.',
        tokenizer: {
            root: [
                {
                    action: {token: 'types'},
                    regex: new RegExp(`\\b(${
                        suggestions.types.map(({name}) => name)
                            .sort((a, b) => a > b ? -1 : 1)
                            .join('|')
                    })\\b`)
                },
                {
                    action: {token: 'globalFunctions'},
                    regex: new RegExp(`\\b(${
                        suggestions.functions
                            .map(({name}) => ['*', '/', '+'].includes(name) ? `\\${name}` : name)
                            .sort((a, b) => a > b ? -1 : 1)
                            .join('|')
                    })\\b`)
                },
                {regex: /'/, action: {token: 'literal', bracket: '@open', next: '@base58literal'}},
                {regex: /'/, action: {token: 'literal', bracket: '@open', next: '@base64literal'}},
                {regex: /'/, action: {token: 'literal', bracket: '@open', next: '@base16literal'}},
                {include: '@whitespace'},
                {regex: /[a-zA-Z_$][\w$]*/, action: {cases: {'@keywords': 'keyword'}}},
                {regex: /"([^"\\]|\\.)*$/, action: {token: 'string.invalid'}},
                {regex: /"/, action: {token: 'string.quote', bracket: '@open', next: '@string'}},

                // numbers
                {regex: /\d*\.\d+([eE][\-+]?\d+)?/, action: {token: 'number.float'}}, //number.float
                {regex: /[0-9_]+/, action: {token: 'number'}}, //number
                {regex: /{-#(.*)#-}/, action: {token: 'directive'}},
                {regex: /@(Verifier|Callable)/, action: {token: 'annotation'}},


            ],
            whitespace: [
                {regex: /[ \t\v\f\r\n]+/, action: {token: 'white'}},
                {regex: /#.*$/, action: {token: 'comment'}},
            ],
            base58literal: [
                {
                    regex: /[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+/,
                    action: {token: 'literal'}
                },
                {regex: /'/, action: {token: 'literal', bracket: '@close', next: '@pop'}}
            ],
            base64literal: [
                {
                    regex: /[[A-Za-z0-9+/=]+/,
                    action: {token: 'literal'}
                },
                {regex: /'/, action: {token: 'literal', bracket: '@close', next: '@pop'}}
            ],
            base16literal: [
                {
                    regex: /[[A-Fa-f0-9]+/,
                    action: {token: 'literal'}
                },
                {regex: /'/, action: {token: 'literal', bracket: '@close', next: '@pop'}}
            ],
            string: [
                {regex: /[^\\"]+/, action: {token: 'string'}},
                {regex: /"/, action: {token: 'string.quote', bracket: '@close', next: '@pop'}}
            ]
        },
        keywords, transactionClasses
    };

    monaco.languages.setLanguageConfiguration(LANGUAGE_ID, {
        brackets: [['{', '}'], ['(', ')']],
        comments: {lineComment: '#'}
    });
    monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, language);

    monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, {
        triggerCharacters: ['.', ':', '|', '@'],
        provideCompletionItems: rideLanguageService.completion.bind(rideLanguageService),
    });

    monaco.languages.registerHoverProvider(LANGUAGE_ID, {
        provideHover: rideLanguageService.hover.bind(rideLanguageService),
    });


    monaco.languages.registerSignatureHelpProvider(LANGUAGE_ID, {
        signatureHelpTriggerCharacters: ['('],
        provideSignatureHelp: rideLanguageService.signatureHelp.bind(rideLanguageService),
    });

    monaco.languages.registerDefinitionProvider(LANGUAGE_ID, {
        provideDefinition: rideLanguageService.provideDefinition.bind(rideLanguageService)
    });

    monaco.editor.defineTheme(DEFAULT_THEME_ID, {
        base: 'vs',
        inherit: true,
        rules: [
            {token: 'keyword', foreground: '#0000ff'},
            {token: 'string', foreground: '#a31415'},
            {token: 'globalFunctions', foreground: '#484292', fontStyle: 'italic'},
            {token: 'typesItalic', foreground: '#4990ad', fontStyle: 'italic'},
            {token: 'types', foreground: '#4990ad'},
            {token: 'literal', foreground: '#a31415', fontStyle: 'italic'},
            {token: 'directive', foreground: '#ff8b1e'},
            {token: 'annotation', foreground: '#f08c3a', fontStyle: 'bold'}
        ],
        colors: {
            'editor.background': '#00000000'
        },
    });

    monaco.editor.defineTheme(DARK_THEME_ID, {
        base: 'vs-dark',
        inherit: true,
        rules: [
            {token: 'globalFunctions', foreground: '#6dd3ff', fontStyle: 'italic'},
            {token: 'typesItalic', foreground: '#fedbed', fontStyle: 'italic'},
            {token: 'types', foreground: '#fedbed'},
            {token: 'directive', foreground: '#ff8b1e'},
        ],
        colors: {
            'editor.background': '#191919'
        }
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        noLib: true,
        module: ModuleKind.CommonJS,
        moduleResolution: 2,
        allowNonTsExtensions: true,
        target: monaco.languages.typescript.ScriptTarget.ES2015,
    });

    monaco.languages.typescript.javascriptDefaults.addExtraLib(testTypings);

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        // noSyntaxValidation: true,
        //noSemanticValidation: true
    });
}
