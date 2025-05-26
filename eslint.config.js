import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
// import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import { defineConfig } from "eslint/config";

export default defineConfig([

  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { js },
    extends: ["js/recommended"],
  },

  {
    files: ["**/*.{js,jsx}"],
    plugins: { react: pluginReact },
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: { version: "detect" },
    },
  },

  {
    files: ["**/*.{js,jsx}"],
    plugins: { "react-hooks": pluginReactHooks },
    rules: pluginReactHooks.configs.recommended.rules,
  },

  // {
  // files: ["**/*.{js,jsx}"],
  // plugins: { "jsx-a11y": pluginJsxA11y },
  // extends: ["plugin:jsx-a11y/recommended"],
  // },
]);
