/**
 * @fileoverview This rule checks the usage of syncronous MongoDB Methods on the Server which will stop working starting from Meteor 3.0 with the fiber removal
 * @author Renan Castro
 * @copyright 2016 Renan Castro. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/no-sync-mongo-methods-on-server');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
  },
});

// TODO makes the tests compatible with const and await
// TODO increase coverage to get back to use all as 100 in the runner
ruleTester.run('no-sync-mongo-methods-on-server', rule, {
  only: true,
  valid: [
    { code: 'TestCollection.findOneAsync()' },
    { code: 'UserAccess.after.insert((userId, doc) => {})' },
    {
      code: `
      var modulesCursor = ModulesCollection.find();
      // missing await due to the TODO above
      modulesCursor.mapAsync(function(module) {return module._id; });
      `,
    },
    {
      code: `
      var modulesCursor = ModulesCollection.find();
      // missing await due to the TODO above
      modulesCursor.forEachAsync(function(module) { console.log(module._id); });
      `,
    },
    {
      code: `
      var modulesCursor = ModulesCollection.find();
      // missing await due to the TODO above
      modulesCursor.fetchAsync();
      `,
    },
    {
      code: `
      var modules = [].filter(() => {});
      modules.fetch();
      `,
    },
    {
      code: `
      crypto
        .createHmac('sha256', secretIntercomKey)
        .update(userId);
      `,
    },
  ],

  invalid: [
    {
      code: 'TestCollection.findOne()',
      errors: [
        { message: 'Should use Meteor async calls use "findOneAsync" instead of "findOne"', type: 'CallExpression' },
      ],
    },
    {
      code: `
      var modulesCursor = ModulesCollection.find();
      var modulesIds = modulesCursor.map(function(module) {return module._id; });
      `,
      errors: [
        { message: 'Should use Meteor async calls use "mapAsync" instead of "map"', type: 'CallExpression' },
      ],
    },
    {
      code: `
      var modulesCursor = ModulesCollection.find();
      var modulesIds = modulesCursor.forEach(function(module) { console.log(module._id); });
      `,
      errors: [
        { message: 'Should use Meteor async calls use "forEachAsync" instead of "forEach"', type: 'CallExpression' },
      ],
    },
    {
      code: `
      var modulesCursor = ModulesCollection.find();
      var modules = modulesCursor.fetch();
      `,
      errors: [
        { message: 'Should use Meteor async calls use "fetchAsync" instead of "fetch"', type: 'CallExpression' },
      ],
    },
  ],
});
