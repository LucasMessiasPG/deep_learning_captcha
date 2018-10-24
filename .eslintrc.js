module.exports = {
    root: true,
    parserOptions: {
      ecmaVersion: 2017,
      sourceType: 'module'
    },
    extends: ['eslint:recommended'],
    env: {
      'node': true
    },
    globals: {

        // global lib
        "Promise": true,
        "Map": true,
        "Set": true,

        // app global
        Exception: true
    },
    rules: {
        'prefer-template': "off",
        'import/no-unresolved': 'off',
        'import/no-extraneous-dependencies': 'off',
        'func-names': 'off',
        'quotes': ["error","double"],
        'space-before-blocks': "error",
        'no-useless-concat': "error",
        'keyword-spacing': ["error", {
            "before": true,
            after: true,
        }],
        'key-spacing': ["error",{
            "beforeColon": false,
            "afterColon": true,
            "align": "value"
        }],
        'semi': "error",
        'no-dupe-args': 'error',
        'valid-typeof': 'error',
        'space-infix-ops': "error",
        'no-multi-spaces': ['error',{
            exceptions: { 
                "VariableDeclarator": true,
                "Property": true
            }
        }],
        'spaced-comment': ["error", "always", { "markers": ["/"] }],
        'comma-dangle': "off",
        'comma-spacing': ["error", {
            before: false,
            after: true
        }],
        'padded-blocks': ["error",{
            "classes": "always",
            "switches": "never",
            "blocks": "never"
        }],
        "switch-colon-spacing": ["error", {"after": true, "before": false}],
        'linebreak-style': 'off',
        'indent': ['error', "tab", { 
            "MemberExpression": 1,
            "SwitchCase": 1
        }],
        'no-tabs': "off",
        'max-len': "off",
        'no-unused-vars': ['error', { 
            "vars": 'local', 
            "args": 'none',
            "ignoreRestSiblings": true 
        }],
        'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
        // 'no-nested-ternary': 'off',
        'no-underscore-dangle': ['warn', {
            'allow': ['_v', '_id', '_correspondent', '_path', '__parent']
        }],
        'object-shorthand': ['error', "consistent"]
    }

};