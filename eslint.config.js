import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Global ignores for directories and generated files
    ignores: ['dist', 'node_modules', 'env.js'],
  },
  // Base configuration using typescript-eslint's recommended rules
  ...tseslint.configs.recommended,
  // Specific configuration for React files in the src directory
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Enforce React Hooks rules for correctness
      ...reactHooks.configs.recommended.rules,
      // Ensure React components are exported correctly for Fast Refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  }
);
