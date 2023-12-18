import { sxzz } from '@sxzz/eslint-config'

export default sxzz({
  files: ['packages/**/*.ts'],
  rules: {
    'unicorn/prefer-top-level-await': 'off',
    'no-console': 'off',
    'no-return-await': 'off'
  }
})
