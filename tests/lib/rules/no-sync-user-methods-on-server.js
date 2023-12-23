/**
 * @fileoverview This rule checks the usage of synchronous user methods on the server.
 * @author Matheus Castro
 * @copyright 2023 Matheus Castro. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/no-sync-user-methods-on-server');

const ruleTester = new RuleTester();

ruleTester.run('no-sync-user-methods-on-server', rule, {
    only: true,
    valid: [
        { code: 'Meteor.userId()' },
        { code: 'Meteor.bindEnvironment()' },
        { code: 'Meteor.settings' },
        { code: 'Customer.user()' },
        { code: 'Meteor.userAsync()' },
    ],

    invalid: [
        {
            code: 'Meteor.user()',
            errors: [
                { message: 'Meteor.user() on the server should be replaced by Meteor.userAsync()', type: 'CallExpression' },
            ],
        },
    ],
});
