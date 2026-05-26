import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // TanStack file-based route modules must `export const Route`, and main.tsx
    // is the app entry — the "component-only export" fast-refresh rule does not
    // apply to either, so disable it just for these.
    files: ['src/routes/**/*.tsx', 'src/main.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
