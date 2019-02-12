import {txTypes} from 'ride-language-server/out/suggestions';

const keywords = ["let", "true", "false", "if", "then", "else", "match", "case"];

const rideLanguageConfig = {
    tokenPostfix: '.',
    tokenizer: {
        root: [
            {regex: /base58'/, action: {token: 'literal', bracket: '@open', next: '@base58literal'}},
            {regex: /base64'/, action: {token: 'literal', bracket: '@open', next: '@base64literal'}},
            {include: '@whitespace'},
            {
                regex: /[a-z_$][\w$]*/, action: {
                    cases: {
                        '@keywords': 'keyword'
                    }
                }
            },
            {regex: /ExchangeTransaction/, action: {token: 'intr'}},
            {regex: /"([^"\\]|\\.)*$/, action: {token: 'string.invalid'}},
            {regex: /"/, action: {token: 'string.quote', bracket: '@open', next: '@string'}},

            // numbers
            {regex:/\d*\.\d+([eE][\-+]?\d+)?/, action: {token: 'number.float'}},//number.float
            {regex:/\d+/, action: {token: 'number'}},//number
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
    keywords, txTypes
};

export default rideLanguageConfig;