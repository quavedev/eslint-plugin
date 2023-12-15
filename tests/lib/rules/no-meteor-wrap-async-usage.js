/**
 * @fileoverview This rule checks the usage of Meteor.wrapAsync method.
 * @author Matheus Castro
 * @copyright 2023 Matheus Castro. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/no-meteor-wrap-async-usage');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('no-meteor-wrap-async-usage', rule, {
  only: true,
  valid: [
    { code: 'Meteor.userAsync()' },
    { code: 'Meteor.userIdAsync()' },
    { code: 'Meteor.callAsync()' },
    { code: 'Meteor.call()' },
    { code: 'this.wrapAsync' },
    { code: 'object.wrapAsync' },
    { code: 'object.wrapAsync()' },
    { code: 'Object.wrapAsync()()' },
  ],

  invalid: [
    {
      code: 'Meteor.wrapAsync',
      errors: [
        { message: 'Meteor wrapAsync is going to be removed on Meteor 3.0', type: 'MemberExpression' },
      ],
    },
    {
      code: 'const asd = Meteor.wrapAsync',
      errors: [
        { message: 'Meteor wrapAsync is going to be removed on Meteor 3.0', type: 'MemberExpression' },
      ],
    },
    {
      code: 'const asd = Meteor.wrapAsync()',
      errors: [
        { message: 'Meteor wrapAsync is going to be removed on Meteor 3.0', type: 'MemberExpression' },
      ],
    },
    {
      code: 'const asd = Meteor.wrapAsync(() => {})',
      errors: [
        { message: 'Meteor wrapAsync is going to be removed on Meteor 3.0', type: 'MemberExpression' },
      ],
    },
    {
      code: 'Meteor.wrapAsync()',
      errors: [
        { message: 'Meteor wrapAsync is going to be removed on Meteor 3.0', type: 'MemberExpression' },
      ],
    },
    {
      code: 'Meteor.wrapAsync(() => {})',
      errors: [
        { message: 'Meteor wrapAsync is going to be removed on Meteor 3.0', type: 'MemberExpression' },
      ],
    },
    {
      code: 'Meteor.wrapAsync()()',
      errors: [
        { message: 'Meteor wrapAsync is going to be removed on Meteor 3.0', type: 'MemberExpression' },
      ],
    },
    {
      code: 'Meteor.wrapAsync(() => {})()',
      errors: [
        { message: 'Meteor wrapAsync is going to be removed on Meteor 3.0', type: 'MemberExpression' },
      ],
    },
  ],
});
