/**
 * @fileoverview This rule checks the usage of Meteor.wrapAsync method.
 * @author Matheus Castro
 * @copyright 2023 Matheus Castro. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

const meteorIdentifier = "Meteor";
const wrapAsyncMethodName = "wrapAsync";
const isAccessingMeteorWrapAsync = (node) => {
  const isMemberExpression = node && node.type === "MemberExpression";
  if (!isMemberExpression) {
    return;
  }

  const nodeObjectName = node &&
    node.object &&
    node.object.type === "Identifier" &&
    node.object.name;
  const nodePropertyName = node &&
    node.property &&
    node.property.type === "Identifier" &&
    node.property.name;

  const isMeteorObject = nodeObjectName && nodeObjectName.toLowerCase() === meteorIdentifier.toLowerCase();
  const isWrapAsyncAccess = nodePropertyName && nodePropertyName === wrapAsyncMethodName;

  return isMeteorObject && isWrapAsyncAccess;
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect `Meteor.wrapAsync` calls',
      recommended: true,
    },
  },
  create: (context) => ({
    MemberExpression: (node) => {
      if (!isAccessingMeteorWrapAsync(node)) {
        return;
      }

      context.report(node, "Meteor wrapAsync is going to be removed on Meteor 3.0");
    },
  }),
};
