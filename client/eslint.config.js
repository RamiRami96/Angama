const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  { ignores: ["dist/*", ".expo/*", "node_modules/*"] },
  {
    files: ["jest.setup.js", "**/*.test.{ts,tsx}"],
    languageOptions: { globals: { jest: "readonly" } },
  },
]);
