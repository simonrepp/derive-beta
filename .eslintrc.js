module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "globals": {
    "atom": true
  },
  "parserOptions": {
    "ecmaVersion": 8
  },
  "rules": {
    "linebreak-style": [
      "error",
      "unix"
    ],
    "no-console": "off",
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ]
  }
};
