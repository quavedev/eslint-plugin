const allRules = {
  'no-sync-mongo-methods-on-server': require('./rules/no-sync-mongo-methods-on-server'),
  'no-fibers-future-usage': require('./rules/no-fibers-future-usage'),
  'no-promise-fibers-usage': require('./rules/no-promise-fibers-usage'),
  'no-meteor-wrap-async-usage': require('./rules/no-meteor-wrap-async-usage'),
  'no-sync-user-methods-on-server': require('./rules/no-sync-user-methods-on-server'),
};

module.exports = {
  rules: allRules,
  configs: {
    recommended: {
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      plugins: ['meteor'],
      rules: {
        'meteor/no-sync-mongo-methods-on-server': 0,
        'meteor/no-fibers-future-usage': 0,
        'meteor/no-promise-fibers-usage': 0,
        'meteor/no-meteor-wrap-async-usage': 0,
        'meteor/no-sync-user-methods-on-server': 0,
      },
    },
  },
};
