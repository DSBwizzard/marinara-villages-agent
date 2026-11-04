import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const maintainedSourceFiles = [
  "packages/**/src/**/*.{js,mjs,ts,tsx}",
  "scripts/**/*.{js,mjs}",
  "tests/**/*.{js,mjs,ts,tsx}",
  "eslint.config.mjs",
  "packages/villages/*.mjs",
  "sources/package-shared.ts",
];

export default tseslint.config(
  {
    ignores: [
      "artifacts/**",
      "catalog/**",
      "node_modules/**",
      "packages/*/client.js",
      "packages/*/server.mjs",
      "sources/engine/**",
    ],
  },
  {
    files: maintainedSourceFiles,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.{js,mjs}"],
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.tsx"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
    },
  },
  {
    files: ["**/*.{js,mjs}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["scripts/**/*.{js,mjs}", "tests/**/*.{js,mjs,ts,tsx}"],
    ignores: ["scripts/esbuild.mjs", "tests/fixtures/browser-diagnostics.mjs"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "esbuild",
              importNames: ["build", "transform"],
              message: "Use scripts/esbuild.mjs so returned warnings fail validation.",
            },
            ...["@playwright/test", "playwright", "playwright-core"].map((name) => ({
              name,
              importNames: ["chromium", "firefox", "webkit"],
              message: "Use the browser-diagnostics fixture so console diagnostics are checked.",
            })),
          ],
        },
      ],
    },
  },
);
