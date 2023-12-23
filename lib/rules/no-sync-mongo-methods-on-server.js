/**
 * @fileoverview This rule checks the usage of syncronous MongoDB Methods on the Server which will stop working starting from Meteor 3.0 with the fiber removal
 * @author Renan Castro
 * @copyright 2016 Renan Castro. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

const { Walker, hasSpecificFunctionInTheChain, shouldSkip, wasCreatedBySpecificFunction, getInitFolder } = require('./helpers');
const { debug } = require('../util/utilities');

const INVALID_FUNCTIONS = {
  findOne: { suggestion: 'findOneAsync', isCollection: true },
  insert: { suggestion: 'insertAsync', isCollection: true },
  update: { suggestion: 'updateAsync', isCollection: true },
  upsert: { suggestion: 'upsertAsync', isCollection: true },
  remove: { suggestion: 'removeAsync', isCollection: true },
  createIndex: {
    suggestion: 'createIndexAsync',
    isCollection: true,
    skipForRawCollection: true,
  },
  fetch: { suggestion: 'fetchAsync', isCursor: true },
  count: { suggestion: 'countAsync', isCursor: true },
  map: { suggestion: 'mapAsync', isCursor: true, debug: true },
  forEach: { suggestion: 'forEachAsync', isCursor: true },
};

const INVALID_FUNCTIONS_NAMES = Object.keys(INVALID_FUNCTIONS);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect sync Meteor calls',
      recommended: true,
    },
    fixable: 'code',
  },
  create: (context) => {
    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    function createError({
      context,
      node,
      invalidFunction,
      invalidFunctionDefinition = '',
    }) {
      const error = {
        node: node.parent,
        message: `Should use Meteor async calls${
          invalidFunctionDefinition.suggestion
            ? ` use "${invalidFunctionDefinition.suggestion}"`
            : ''
        } instead of "${invalidFunction}"`,
      };
      context.report(error);
    }

    // ---------------------------------------------------------------------------
    // Public
    // ---------------------------------------------------------------------------

    return {
      Program: function () {
        // if NYC_PROCESS_ID is present it means we are running tests
        const isTest = !!process.env.NYC_PROCESS_ID;
        // TODO support multiple directories https://quave.slack.com/archives/C0606SXCXFW/p1702639670046879?thread_ts=1702637224.400439&cid=C0606SXCXFW
        new Walker(getInitFolder(context)).walkApp({
          archList: ['server'],
          isTest,
          onFile: ({ path }) => {
            debug(`Processing file ${path}`);
          },
        });
      },
      MemberExpression: function (node) {
        // TODO fix coverage
        const isTest = !!process.env.NYC_PROCESS_ID;
        if(!isTest && shouldSkip(context)) {
          return;
        }
        // CallExpression means it's a function call so we don't throw an error for example for a property called count in an object but we do throw when it's a count() function call.
        if (node.property && node.property.type === 'Identifier') {
          const invalidFunction = INVALID_FUNCTIONS_NAMES.find(
            (ifn) => ifn === node.property.name
          );
          const invalidFunctionDefinition =
            invalidFunction && INVALID_FUNCTIONS[invalidFunction];
          if (invalidFunctionDefinition) {
            if (invalidFunctionDefinition.debug) {
              debug(node);
            }
            if (
              invalidFunctionDefinition.skipForRawCollection &&
              hasSpecificFunctionInTheChain({
                node,
                functionName: 'rawCollection',
              })
            ) {
              debug(
                `Skipping ${invalidFunction} to be considered error because it was used after rawCollection()`
              );
              return;
            }
            if (invalidFunctionDefinition.isCursor) {
              const isCursorChain = hasSpecificFunctionInTheChain({
                node,
                functionName: 'find',
              });

              const wasCreatedByFind =
                !isCursorChain &&
                wasCreatedBySpecificFunction({
                  context,
                  node,
                  functionName: 'find',
                });

              if (!isCursorChain && !wasCreatedByFind) {
                debug(
                  `Skipping ${invalidFunction} to be considered error because it was used not in a cursor`,
                  { isCursorChain, wasCreatedByFind }
                );
                return;
              }
            }
            createError({
              context,
              node,
              invalidFunction,
              invalidFunctionDefinition,
            });
          }
        }
      },
    };
  },
};
