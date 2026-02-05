module.exports = {
  extends: ["../../packages/config/eslint.base.cjs", "plugin:react/recommended"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json"
  },
  env: {
    browser: true
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  plugins: ["react-hooks", "react-refresh"],
  rules: {
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }]
  }
};
