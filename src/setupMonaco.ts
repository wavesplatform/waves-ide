import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { LspService } from '@waves/ride-language-server/LspService';
import { transactionClasses } from '@waves/ride-language-server/suggestions';
import { MonacoLspServiceAdapter } from '@utils/MonacoLspServiceAdapter';

export const languageService = new MonacoLspServiceAdapter(new LspService());

export const LANGUAGE_ID = 'ride';
export const THEME_ID = 'wavesDefaultTheme';

export default function setupMonaco(){
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
                    regex: /\bTransferTransaction|IssueTransaction|ReissueTransaction|BurnTransaction|LeaseTransaction|LeaseCancelTransaction|MassTransferTransaction|CreateAliasTransaction|SetScriptTransaction|SponsorFeeTransaction|ExchangeTransaction|DataTransaction|SetAssetScriptTransaction\b/
                },
                {
                    action: {token: 'globalFunctions'},
                    regex: /\b(WriteSet|TransferSet|keccak256|blake2b256|sha256|sigVerify|toBase58String|fromBase58String|toBase64String|fromBase64String|transactionById|transactionHeightById|addressFromRecipient|addressFromString|addressFromPublicKey|wavesBalance|assetBalance|getInteger|getBoolean|getBinary|getString|getInteger|getBoolean|getBinary|getString|getInteger|getBoolean|getBinary|getString|fraction|size|toBytes|take|drop|takeRight|dropRight|toString|isDefined|extract|throw)\b/
                },
                {
                    action: {token: 'typesItalic'},
                    regex: /\bAddress|Alias|Transfer|Order|DataEntry|GenesisTransaction|PaymentTransaction\b/
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
                //{ regex: /^[ \t\v\f]*#\w.*$/, action: { token: 'namespace.cpp' } },
                {regex: /[ \t\v\f\r\n]+/, action: {token: 'white'}},
                //{ regex: /\/\*/, action: { token: 'comment', next: '@comment' } },
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


    //monaco.languages.setLanguageConfiguration(LANGUAGE_ID, {})
    monaco.languages.setLanguageConfiguration(LANGUAGE_ID, {brackets: [['{', '}'], ['(', ')']]});
    monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, language);

    monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, {
        triggerCharacters: ['.', ':'],
        provideCompletionItems: languageService.completion.bind(languageService),
    });

    monaco.languages.registerHoverProvider(LANGUAGE_ID, {
        provideHover: languageService.hover.bind(languageService),
    });

    monaco.languages.registerSignatureHelpProvider(LANGUAGE_ID, {
        signatureHelpTriggerCharacters: ['('],
        provideSignatureHelp: languageService.signatureHelp.bind(languageService),
    });

    monaco.editor.defineTheme(THEME_ID, {
        base: 'vs',
        colors: {},
        inherit: true,
        rules: [
            {token: 'keyword', foreground: '0000ff'},
            {token: 'string', foreground: 'a31415'},
            {token: 'globalFunctions', foreground: '484292', fontStyle: 'italic'},
            //{token: 'number', foreground: '8e5c94'},
            {token: 'typesItalic', foreground: '4990ad', fontStyle: 'italic'},
            {token: 'types', foreground: '4990ad'},
            {token: 'literal', foreground: 'a31415', fontStyle: 'italic'},
            {token: 'directive', foreground: 'aaaaaa'},
            {token: 'annotation', foreground: 'f08c3a', fontStyle: 'bold'}
            // {token: 'comment', foreground: '757575'}
        ]
    });
}
