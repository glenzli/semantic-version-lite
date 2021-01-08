module.exports = {
  extends: [
    '@glenzli/eslint-config',
  ],
  env: {
    node: true,
    jest: true,
    browser: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    "project": "./tsconfig.json",
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  plugins: [
    '@typescript-eslint',
  ],
};
