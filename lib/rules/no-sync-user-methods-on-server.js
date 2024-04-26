/**
 * @fileoverview This rule checks the usage of synchronous user methods on the server.
 * @author Matheus Castro
 * @copyright 2023 Matheus Castro. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

const { Walker, getInitFolder, shouldSkip } = require('../util/walker');
const { debug } = require("../util/utilities");

function isCallingUserMethod(node) {
    const isCallExpression = node &&
        node.type === "CallExpression";
    if (!isCallExpression) {
        return false;
    }

    const isCallOnMeteorObject = node &&
        node.callee &&
        node.callee.type === "MemberExpression" &&
        node.callee.object &&
        node.callee.object.type === "Identifier" &&
        node.callee.object.name &&
        node.callee.object.name.toLowerCase() === "meteor";

    if (!isCallOnMeteorObject) {
        return false;
    }

    const calledPropertyName = isCallOnMeteorObject &&
        node.callee.property &&
        node.callee.property.type === "Identifier" &&
        node.callee.property.name

    return calledPropertyName && calledPropertyName.toLowerCase() === "user";
}

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Detect `Meteor.user()` calls on the server',
            recommended: true,
        },
    },
    create: (context) => {
        const isTest = !!process.env.NYC_PROCESS_ID;
        return {
            Program: function () {
                new Walker(getInitFolder(context)).walkApp({
                    archList: ['server'],
                    isTest,
                    onFile: ({ path }) => {
                        debug(`Processing file no-sync-user-methods-on-server ${path}`);
                    },
                });
            },
            CallExpression: function(node) {
                if (!isTest && shouldSkip(context)) {
                    return;
                }

                if (isCallingUserMethod(node)) {
                    return context.report(node, 'Meteor.user() on the server should be replaced by Meteor.userAsync()');
                }
            },
        };
    },
};
