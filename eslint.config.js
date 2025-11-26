const {parser:tsparser,plugin:tsplugin} = require('typescript-eslint');
const globals = require("globals");

module.exports = [
    {
        ignores: ["*.js", "dist/**", "backup/**", "scripts/**"],
        plugins: {
            "@typescript-eslint": tsplugin
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parser:tsparser,
            parserOptions: {
                project: "tsconfig.json",
                tsconfigRootDir: __dirname
            },
            globals: {
                ...globals.node,
                ...globals.commonjs,
            },
        },
    },
    {
        files: ['src/**/*.ts'],
        ignores: ['src/test/**'],
        rules: {
            semi: ['error', 'always'],
            '@typescript-eslint/promise-function-async': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            'import/no-duplicates': 'error',
        },
    }
];
