/**
 * @fileoverview This rule checks the usage of Meteor Promise Fibers methods.
 * @author Matheus Castro
 * @copyright 2023 Matheus Castro. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/no-fibers-future-usage');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
});

ruleTester.run('no-fibers-future-usage', rule, {
  only: true,
  valid: [
    { code: 'import asd from "asd"' },
    { code: 'const asd = require("dd")' },
    { code: 'const aa = new Test()' },
    { code: 'Testing(function() {})' },
    { code: 'User.current' },
  ],

  invalid: [
    {
      code: 'import Future from "fibers/future"',
      errors: [
        { message: 'Invalid import/require of Fibers/Future', type: 'ImportDeclaration' },
      ],
    },
    {
      code: 'require("fibers/future")',
      errors: [
        { message: 'Invalid import/require of Fibers/Future', type: 'CallExpression' },
      ],
    },
    {
      code: 'const asd = new Future()',
      errors: [
        { message: 'Invalid usage of Future', type: 'NewExpression' },
      ],
    },
    {
      code: 'Future.fromPromise(asyncValue)',
      errors: [
        { message: 'Invalid usage of Future', type: 'MemberExpression' },
      ],
    },
    {
      code: 'Future.wait([])',
      errors: [
        { message: 'Invalid usage of Future', type: 'MemberExpression' },
      ],
    },
    {
      code: 'Future.task()',
      errors: [
        { message: 'Invalid usage of Future', type: 'MemberExpression' },
      ],
    },
    {
      code: 'Future.wrap()',
      errors: [
        { message: 'Invalid usage of Future', type: 'MemberExpression' },
      ],
    },
    {
      code: 'Fiber(function() {})',
      errors: [
        { message: 'Invalid usage of Fibers', type: 'CallExpression' },
      ],
    },
    {
      code: 'Fiber.current',
      errors: [
        { message: 'Invalid usage of Fibers', type: 'MemberExpression' },
      ],
    },
    {
      code: 'Fiber.yield()',
      errors: [
        { message: 'Invalid usage of Fibers', type: 'MemberExpression' },
      ],
    },
  ],
});
