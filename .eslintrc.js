module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        ecmaVersion: 'latest',
        ecmaFeatures: {
            jsx: false
        }
    },
    plugins: ['@typescript-eslint/eslint-plugin', 'simple-import-sort', 'sonarjs', 'import', 'unicorn', 'prettier'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:sonarjs/recommended',
        'plugin:security/recommended',
        'plugin:unicorn/recommended'
    ],
    root: true,
    env: {
        node: true,
        jest: true
    },
    ignorePatterns: ['.eslintrc.js', 'dist'],
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
        'prettier/prettier': ['error', {
            'parser': 'typescript',
            'singleQuote': true,
            'tabWidth': 4,
            'tabs': false,
            'semicolons': true,
            'arrowParens': 'avoid',
            'trailingComma': 'all'
        }],
        'unicorn/prevent-abbreviations': 'off',
        'unicorn/filename-case': 'off',
        'unicorn/no-null': 'off',
        'unicorn/prefer-module': 'off',
    }
};
