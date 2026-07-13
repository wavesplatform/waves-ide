const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const importPlugin = require('eslint-plugin-import');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
    {
        ignores: [
            'dist/**',
            'build/**',
            'node_modules/**',
            'src/json-data/test-typings.json'
        ]
    },
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            import: importPlugin,
            prettier: prettierPlugin
        },
        rules: {
            'prettier/prettier': 'off',
            'import/no-unresolved': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
        }
    }
];
