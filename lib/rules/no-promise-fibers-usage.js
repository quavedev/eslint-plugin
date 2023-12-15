/**
 * @fileoverview This rule checks the usage of Meteor Promise Fibers methods.
 * @author Matheus Castro
 * @copyright 2023 Matheus Castro. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

const promiseFiberPrototypeAwait = "await";
const promiseFiberMethods = [
  "await",
  "awaitAll",
  "async",
  "asyncApply",
];

const isGlobalPromiseFiber = (node) => {
  const nodeObjectName = node &&
    node.object &&
    node.object.type === "Identifier" &&
    node.object.name;

  return nodeObjectName === "Promise";
};

const isUsingNotAllowedPromiseFiberMethod = (node) => {
  if (!isGlobalPromiseFiber(node)) {
    return;
  }

  const nodePropertyName = node &&
    node.property &&
    node.property.type === "Identifier" &&
    node.property.name;

  return promiseFiberMethods.includes(nodePropertyName);
}

const isPromisePrototypeAwaitCall = (node) => {
  const isMemberExpression = node && node.type === "MemberExpression";
  if (!isMemberExpression) {
    return;
  }

  const isAccessingGlobalPromise = node &&
    node.object &&
    node.object.type === "Identifier" &&
    node.object.name === "Promise";
  if (isAccessingGlobalPromise) {
    return;
  }

  const nodePropertyName = node &&
    node.property &&
    node.property.type === "Identifier" &&
    node.property.name;

  return nodePropertyName === promiseFiberPrototypeAwait;
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect `Promise` Fibers abstraction calls',
      recommended: true,
    },
  },
  create: (context) => ({
    MemberExpression: (node) => {
      if (isUsingNotAllowedPromiseFiberMethod(node)) {
        return context.report(node, `Promise.${node.property.name}() is a Fibers abstraction for Promises should be replaced by native methods`);
      }

      if (isPromisePrototypeAwaitCall(node)) {
        return context.report(node, "Promise Fibers prototype await call is not allowed");
      }
    },
  }),
};
