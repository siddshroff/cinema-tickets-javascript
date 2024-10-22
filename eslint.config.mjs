import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("eslint:recommended", "plugin:jsdoc/recommended"), {
    ignores: ["./src/pairtest/TicketRequest.js, ./eslint.config.mjs"],
    languageOptions: {
        globals: {
            ...globals.mocha,
        },

        ecmaVersion: 2018,
        sourceType: "module",
    },
    // excludes: [
    //     "test/**/*.js"
    // ],
    rules: {
        "brace-style": ["error", "1tbs", {
            allowSingleLine: false,
        }],

        curly: ["error", "all"],
        indent: ["error", 2],
        "no-plusplus": "off",

        semi: ["error", "always", {
            omitLastInOneLineBlock: false,
        }]
    },
}];