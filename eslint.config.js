import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  // Ignore build outputs
  {
    ignores: ["**/dist/**", "**/build/**", "node_modules/**"],
  },

  // Frontend (client/)
  {
    files: ["client/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    // Instead of "extends", spread configs directly:
    ...js.configs.recommended,
    ...react.configs.recommended,
    ...reactHooks.configs.recommended,
    rules: {
      "react/react-in-jsx-scope": "off", // not needed in React 17+
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },

  // Backend (server/)
  {
    files: ["server/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    ...js.configs.recommended,
  },
];
