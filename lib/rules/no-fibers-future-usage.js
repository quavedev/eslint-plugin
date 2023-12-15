/**
 * @fileoverview This rule checks the usage of Fibers/Future directly.
 * @author Matheus Castro
 * @copyright 2023 Matheus Castro. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

const futureMethods = [
  "wrap",
  "task",
  "wait",
  "fromPromise",
];

const fibersMethods = [
  "yield",
  "current",
];

const isCreatingFuture = (node) => {
  const isNewExpression = node &&
    node.type === "NewExpression";
  if (!isNewExpression) {
    return false;
  }

  const newExpressionCalleeName = node &&
    node.callee &&
    node.callee.type === "Identifier" &&
    node.callee.name;

  return newExpressionCalleeName && newExpressionCalleeName.toLowerCase()  === "future";
};

const isUsingFutureMethods = (node) => {
  const isMemberExpression = node &&
    node.type === "MemberExpression";
  if (!isMemberExpression) {
    return false;
  }

  const nodeObjectIsFuture = node &&
    node.object &&
    node.object.type === "Identifier" &&
    node.object.name &&
    node.object.name.toLowerCase() === "future";

  const nodePropertyName = node &&
    node.property &&
    node.property.type === "Identifier" &&
    node.property.name;

  return nodeObjectIsFuture && nodePropertyName && futureMethods.includes(nodePropertyName);
};

const isCallingFibers = (node) => {
  const isCallExpression = node &&
    node.type === "CallExpression";
  if (!isCallExpression) {
    return false;
  }

  const identifierName = node &&
    node.callee &&
    node.callee.type === "Identifier" &&
    node.callee.name;

  return identifierName && identifierName.toLowerCase() === "fiber";
};

const isUsingFibersMethods = (node) => {
  const isMemberExpression = node &&
    node.type === "MemberExpression";
  if (!isMemberExpression) {
    return false;
  }

  const nodeObjectIsFiber = node &&
    node.object &&
    node.object.type === "Identifier" &&
    node.object.name &&
    node.object.name.toLowerCase() === "fiber";

  const propertyName = node &&
    node.property &&
    node.property.type === "Identifier" &&
    node.property.name;

  return nodeObjectIsFiber && propertyName && fibersMethods.includes(propertyName.toLowerCase());
};

const includesFibersOrFuturePath = (toTest) => toTest &&
  typeof toTest === "string" &&
  ["fibers", "future"].some((t) => toTest.toLowerCase().includes(t));

const isImportingFibersOrFuture = (node) => {
  const isImportDeclaration = node &&
    node.type === "ImportDeclaration";
  if (!isImportDeclaration) {
    return false;
  }

  const nodeSourceLiteral = node &&
    node.source &&
    node.source.type === "Literal" &&
    node.source.value;

  return includesFibersOrFuturePath(nodeSourceLiteral);
};

const isRequiringFibersOrFuture = (node) => {
  const isCallExpression = node &&
    node.type === "CallExpression";
  if (!isCallExpression) {
    return false;
  }

  const nodeCalleeName = node &&
    node.callee &&
    node.callee.type === "Identifier" &&
    node.callee.name;
  const nodeRequirePath = node &&
    node.arguments &&
    node.arguments[0] &&
    node.arguments[0].type === "Literal" &&
    node.arguments[0].value;

  return nodeCalleeName && nodeCalleeName.toLowerCase() === "require" && includesFibersOrFuturePath(nodeRequirePath);
};

const futureUsageError = "Invalid usage of Future";
const fibersUsageError = "Invalid usage of Fibers";
const fibersFutureImportError = "Invalid import/require of Fibers/Future";

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect Fibers/Future usages',
      recommended: true,
    },
  },
  create: (context) => ({
    ImportDeclaration: (node) => {
      if (!isImportingFibersOrFuture(node)) {
        return;
      }

      return context.report(node, fibersFutureImportError);
    },
    NewExpression: (node) => {
      if (!isCreatingFuture(node)) {
        return;
      }

      return context.report(node, futureUsageError);
    },
    CallExpression: (node) => {
      if (isCallingFibers(node)) {
        return context.report(node, fibersUsageError);
      }

      if (isRequiringFibersOrFuture(node)) {
        return context.report(node, fibersFutureImportError);
      }
    },
    MemberExpression: (node) => {
      if (isUsingFibersMethods(node)) {
        return context.report(node, fibersUsageError);
      }

      if (isUsingFutureMethods(node)) {
        return context.report(node, futureUsageError);
      }
    },
  }),
};
