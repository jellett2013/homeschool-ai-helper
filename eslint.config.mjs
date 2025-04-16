import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginReact from "eslint-plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals"),

  {
    rules: {
      "react/display-name": "off", // ✅ disable this rule to fix Vercel build
    },
    plugins: {
      react: eslintPluginReact,
    },
  },
];
