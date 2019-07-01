import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { LspService } from '@waves/ride-language-server/LspService';
import { Suggestions } from '@waves/ride-language-server/suggestions';
import { MonacoLspServiceAdapter } from '@utils/MonacoLspServiceAdapter';
import testTypings from './testTypings.json';


const suggestions = new Suggestions();
suggestions.updateSuggestions(3);
const transactionClasses = suggestions.types.find(({name}) => name === 'Transaction')!.type;

export const languageService = new MonacoLspServiceAdapter(new LspService());

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
    const keywords = ['let', 'true', 'false', 'if', 'then', 'else', 'match', 'case', 'base58', 'func'];
    const language = {
        tokenPostfix: '.',
        tokenizer: {
            root: [
                {
                    action: {token: 'types'},
                    regex: new RegExp(`(${
                        suggestions.types.map(({name}) => name)
                            .sort((a, b) => a > b ? -1 : 1)
                            .join('|')
                        })`)
                },
                {
                    action: {token: 'globalFunctions'},
                    regex: new RegExp(`(${
                        suggestions.functions
                            .map(({name}) => ['*', '/', '+'].includes(name) ? `\\${name}` : name)
                            .sort((a, b) => a > b ? -1 : 1)
                            .join('|')
                        })`)
                },
                {regex: /'/, action: {token: 'literal', bracket: '@open', next: '@base58literal'}},
                {regex: /'/, action: {token: 'literal', bracket: '@open', next: '@base64literal'}},
                {include: '@whitespace'},
                {regex: /[a-z_$][\w$]*/, action: {cases: {'@keywords': 'keyword'}}},
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
        provideCompletionItems: languageService.completion.bind(languageService),
    });

    monaco.languages.registerHoverProvider(LANGUAGE_ID, {
        provideHover: languageService.hover.bind(languageService),
    });

    monaco.languages.registerSignatureHelpProvider(LANGUAGE_ID, {
        signatureHelpTriggerCharacters: ['('],
        provideSignatureHelp: languageService.signatureHelp.bind(languageService),
    });

    monaco.editor.defineTheme(DEFAULT_THEME_ID, {
        base: 'vs',
        colors: {},
        inherit: true,
        rules: [
            {token: 'keyword', foreground: '0000ff'},
            {token: 'string', foreground: 'a31415'},
            {token: 'globalFunctions', foreground: '484292', fontStyle: 'italic'},
            {token: 'typesItalic', foreground: '4990ad', fontStyle: 'italic'},
            {token: 'types', foreground: '4990ad'},
            {token: 'literal', foreground: 'a31415', fontStyle: 'italic'},
            {token: 'directive', foreground: '#ff8b1e'},
            {token: 'annotation', foreground: 'f08c3a', fontStyle: 'bold'}
        ]
    });

    monaco.editor.defineTheme(DARK_THEME_ID, {
        base: 'vs-dark',
        colors: {},
        inherit: true,
        rules: []
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        noLib: true,
        allowNonTsExtensions: true,
    });
    monaco.languages.typescript.javascriptDefaults.addExtraLib(testTypings.join('\n'));
}
