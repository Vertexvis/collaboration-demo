const js = require("@eslint/js");
const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  { ignores: [".next/**", "eslint.config.js", "next-env.d.ts"] },
  ...compat.extends(
    "eslint:recommended",
    "next",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
  ),
  ...compat.config({
    env: { browser: true, es2022: true, node: true },
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: 12,
      sourceType: "module",
    },
    plugins: ["@typescript-eslint", "react", "simple-import-sort"],
    rules: {
      "no-await-in-loop": "warn",
      "no-return-await": "warn",
      "require-await": "warn",
      "simple-import-sort/imports": "warn",
    },
    settings: { react: { version: "detect" } },
  }),
];
