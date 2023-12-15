/**
 * @fileoverview This rule checks the usage of Meteor Promise Fibers methods.
 * @author Matheus Castro
 * @copyright 2023 Matheus Castro. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/no-promise-fibers-usage');

const ruleTester = new RuleTester();

ruleTester.run('no-promise-fibers-usage', rule, {
  only: true,
  valid: [
    { code: 'Promise.all([])' },
    { code: 'Promise.any([])' },
    { code: 'Promise.allSettled([])' },
    { code: 'await (function(){ return new Promise()})()'}
  ],

  invalid: [
    {
      code: 'Promise.await()',
      errors: [
        { message: 'Promise.await() is a Fibers abstraction for Promises should be replaced by native methods', type: 'MemberExpression' },
      ],
    },
    {
      code: 'Promise.awaitAll()',
      errors: [
        { message: 'Promise.awaitAll() is a Fibers abstraction for Promises should be replaced by native methods', type: 'MemberExpression' },
      ],
    },
    {
      code: 'Promise.async(function() {})',
      errors: [
        { message: 'Promise.async() is a Fibers abstraction for Promises should be replaced by native methods', type: 'MemberExpression' },
      ],
    },
    {
      code: 'Promise.asyncApply(function() {})',
      errors: [
        { message: 'Promise.asyncApply() is a Fibers abstraction for Promises should be replaced by native methods', type: 'MemberExpression' },
      ],
    },
    {
      code: 'asd().await()',
      errors: [
        { message: 'Promise Fibers prototype await call is not allowed', type: 'MemberExpression' },
      ],
    },
  ],
});
