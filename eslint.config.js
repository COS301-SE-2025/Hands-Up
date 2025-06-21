import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default defineConfig([

  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2021,
    },
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

  {
    files: ["**/*.js"], 
    languageOptions: {
      globals: {
        ...globals.node,
        process: "readonly", 
      },
      ecmaVersion: 2021,
    },
  }

]);
