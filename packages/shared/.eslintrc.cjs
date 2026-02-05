module.exports = {
  extends: ["../../packages/config/eslint.base.cjs"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json"
  }
};
