import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import pluginNext from '@next/eslint-plugin-next';
import stylistic from '@stylistic/eslint-plugin';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

import tailwindcss from 'eslint-plugin-tailwindcss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Global ignores - ESLint 9 style
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'build/**',
      '.git/**',
      'public/mockServiceWorker.js',
      '.vercel/**',
      '.turbo/**',
      'out/**',
      'storybook-static/**',
      'next.config.ts',
    ],
  },

  // Next.js core configurations
  ...compat.extends('next/core-web-vitals'),
  ...compat.extends('next/typescript'),

  // Prettier integration
  eslintConfigPrettier,

  {
    name: 'main-config',
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: true,
        tsconfigRootDir: __dirname,
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      '@next/next': pluginNext,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      prettier,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
      tailwindcss,
      '@stylistic': stylistic,
    },
    rules: {
      // TypeScript-ESLint v8 enhanced rules
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      // '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/prefer-return-this-type': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      // '@typescript-eslint/no-unsafe-argument': 'error',
      // '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      // '@typescript-eslint/no-unsafe-member-access': 'error',
      // '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
          allowBoolean: true,
          allowAny: false,
          allowNullish: true,
          allowRegExp: false,
        },
      ],
      '@typescript-eslint/no-confusing-void-expression': 'error',
      '@typescript-eslint/non-nullable-type-assertion-style': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-literal-enum-member': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
      '@typescript-eslint/prefer-ts-expect-error': 'error',
      '@typescript-eslint/unified-signatures': 'error',

      // React 19 optimized rules
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
      'react/jsx-key': [
        'error',
        {
          checkFragmentShorthand: true,
          checkKeyMustBeforeSpread: true,
          warnOnDuplicates: true,
        },
      ],
      'react/jsx-no-leaked-render': 'error',
      'react/jsx-curly-brace-presence': [
        'error',
        {
          props: 'never',
          children: 'never',
          propElementValues: 'always',
        },
      ],
      'react/self-closing-comp': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/jsx-fragments': ['error', 'syntax'],
      'react/no-array-index-key': 'warn',
      'react/destructuring-assignment': ['error', 'always'],
      'react/jsx-pascal-case': 'error',
      'react/no-unstable-nested-components': 'error',
      // 'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
      // 'react/jsx-props-no-spreading': [
      //   'warn',
      //   {
      //     html: 'enforce',
      //     custom: 'ignore',
      //     explicitSpread: 'ignore',
      //   },
      // ],
      'react/no-danger': 'warn',
      'react/prefer-stateless-function': 'error',
      'react/jsx-sort-props': [
        'warn',
        {
          callbacksLast: true,
          shorthandFirst: true,
          multiline: 'last',
          reservedFirst: true,
        },
      ],

      // React Hooks enhanced rules
      'react-hooks/exhaustive-deps': 'error', // Stricter in 2025
      'react-hooks/rules-of-hooks': 'error',

      // Next.js specific rules
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'error',
      '@next/next/no-unwanted-polyfillio': 'error',
      '@next/next/no-page-custom-font': 'error',
      '@next/next/no-title-in-document-head': 'error',
      '@next/next/google-font-display': 'error',
      '@next/next/google-font-preconnect': 'error',
      '@next/next/no-css-tags': 'error',
      '@next/next/no-sync-scripts': 'error',
      '@next/next/no-document-import-in-page': 'error',
      '@next/next/no-head-import-in-document': 'error',
      '@next/next/no-script-component-in-head': 'error',
      '@next/next/no-styled-jsx-in-document': 'error',
      '@next/next/no-typos': 'error',
      '@next/next/no-duplicate-head': 'error',

      // Accessibility - enhanced for 2025
      'jsx-a11y/alt-text': [
        'error',
        {
          elements: ['img', 'object', 'area', 'input[type="image"]'],
          img: ['Image'],
          object: ['Object'],
          area: ['Area'],
          'input[type="image"]': ['InputImage'],
        },
      ],
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'],
          specialLink: ['hrefLeft', 'hrefRight'],
          aspects: ['invalidHref', 'preferButton'],
        },
      ],
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/media-has-caption': 'warn',
      'jsx-a11y/mouse-events-have-key-events': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-distracting-elements': 'error',

      // Prettier integration
      'prettier/prettier': 'error',

      // Import sorting - Next.js 15 optimized
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect imports
            ['^\\u0000'],

            // React and Next.js core - highest priority
            ['^react$', '^react/.*'],
            ['^next$', '^next/.*'],

            // Node.js built-in modules
            ['^node:', '^fs$', '^path$', '^url$', '^crypto$', '^os$'],

            // External packages
            ['^@?\\w'],

            // Internal packages - organized by architectural layers
            ['^@/env', '^@/config', '^@/constants'],
            ['^@/lib', '^@/utils'],
            ['^@/types', '^@/schemas'],
            ['^@/hooks', '^@/stores', '^@/context'],
            ['^@/server', '^@/db', '^@/api'],
            ['^@/components/ui', '^@/components/forms'],
            ['^@/components'],
            ['^@/features', '^@/modules'],
            ['^@/app', '^@/pages'],
            ['^@/styles'],
            ['^@/.*'],

            // Relative imports - parent then sibling
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],

            // Style imports last
            ['^.+\\.?(css|scss|sass|less|styl)$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      // Unused imports handling
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Tailwind CSS rules - enhanced for v4
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/enforces-negative-arbitrary-values': 'warn',
      'tailwindcss/enforces-shorthand': 'warn',
      'tailwindcss/migration-from-tailwind-2': 'off',
      'tailwindcss/no-arbitrary-value': 'off',
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/no-contradicting-classname': 'error',

      // Stylistic rules for code consistency
      // '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/semi': ['error', 'always'],
      // '@stylistic/comma-dangle': [
      //   'error',
      //   {
      //     arrays: 'always-multiline',
      //     objects: 'always-multiline',
      //     imports: 'always-multiline',
      //     exports: 'always-multiline',
      //     functions: 'never',
      //   },
      // ],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: { delimiter: 'semi', requireLast: true },
          singleline: { delimiter: 'semi', requireLast: false },
        },
      ],

      // General code quality - 2025 standards
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'prefer-destructuring': [
        'warn',
        {
          object: true,
          array: false,
        },
      ],
      'no-useless-rename': 'error',
      'prefer-arrow-callback': 'error',
      'no-await-in-loop': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-return-assign': 'error',
      'no-param-reassign': ['error', { props: false }],
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'no-else-return': 'error',
      'prefer-exponentiation-operator': 'error',
      'prefer-numeric-literals': 'error',
      'prefer-object-spread': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'spaced-comment': ['error', 'always', { markers: ['/'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],
      'dot-notation': 'error',
      'no-lonely-if': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'array-callback-return': ['error', { allowImplicit: true }],
      // 'consistent-return': 'error',
      'default-case-last': 'error',
      'grouped-accessor-pairs': 'error',
      'no-constructor-return': 'error',
      // 'no-implicit-coercion': 'error',
      'no-lone-blocks': 'error',
      'no-multi-assign': 'error',
      'no-new-wrappers': 'error',
      'no-object-constructor': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unreachable-loop': 'error',
      'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
      'no-useless-call': 'error',
      'no-useless-computed-key': 'error',
      'prefer-regex-literals': 'error',
      radix: 'error',
      'symbol-description': 'error',
      yoda: 'error',

      // Performance and security - enhanced for 2025
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-global-assign': 'error',
      'no-implicit-globals': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: true,
        },
      },
      tailwindcss: {
        callees: ['cn', 'clsx', 'cva', 'tv'],
        config: './tailwind.config.ts',
        classRegex: '^class(Name)?$',
      },
      next: {
        rootDir: __dirname,
      },
    },
  },

  {
    name: 'typescript-specific',
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': false,
          'ts-nocheck': false,
          'ts-check': false,
          minimumDescriptionLength: 10,
        },
      ],
      '@typescript-eslint/no-unused-vars': 'off', // Handled by unused-imports
      '@typescript-eslint/consistent-type-exports': [
        'error',
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-unnecessary-qualifier': 'error',
      '@typescript-eslint/no-unnecessary-type-arguments': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/no-useless-empty-export': 'error',
      '@typescript-eslint/prefer-enum-initializers': 'error',
    },
  },

  {
    name: 'config-files',
    files: [
      '*.config.{js,ts,mjs,cjs}',
      '*.config.*.{js,ts,mjs,cjs}',
      'tailwind.config.{js,ts}',
      'postcss.config.{js,ts}',
      'vite.config.{js,ts}',
      'playwright.config.{js,ts}',
    ],
    rules: {
      'import/no-default-export': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
    },
  },

  {
    name: 'storybook-files',
    files: [
      '**/*.stories.{js,jsx,ts,tsx}',
      '**/.storybook/**/*.{js,jsx,ts,tsx}',
      '**/stories/**/*.{js,jsx,ts,tsx}',
    ],
    rules: {
      'import/no-default-export': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react/jsx-props-no-spreading': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  {
    name: 'next-app-router',
    files: [
      '**/app/**/route.{js,ts}',
      '**/app/**/layout.{js,tsx}',
      '**/app/**/page.{js,tsx}',
      '**/app/**/loading.{js,tsx}',
      '**/app/**/error.{js,tsx}',
      '**/app/**/not-found.{js,tsx}',
      '**/app/**/global-error.{js,tsx}',
      '**/app/**/template.{js,tsx}',
      '**/app/**/default.{js,tsx}',
    ],
    rules: {
      'import/no-default-export': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react/function-component-definition': 'off',
    },
  },

  {
    name: 'next-pages-router',
    files: ['**/pages/**/*.{js,jsx,ts,tsx}', '**/pages/api/**/*.{js,ts}'],
    rules: {
      'import/no-default-export': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react/function-component-definition': 'off',
    },
  },

  {
    name: 'middleware-files',
    files: ['**/middleware.{js,ts}', '**/instrumentation.{js,ts}'],
    rules: {
      'import/no-default-export': 'off',
      'no-console': ['error', { allow: ['warn', 'error', 'info', 'log'] }],
    },
  },

  {
    name: 'environment-files',
    files: ['**/.env*', '**/env.{js,ts,mjs}', '**/env.*.{js,ts,mjs}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];

export default eslintConfig;
