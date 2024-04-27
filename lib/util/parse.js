const { parse: meteorBabelParser } = require('meteor-babel/parser.js');
const fs = require('fs');
const path = require('path');
const { parse } = require('recast');
const defaultParserOptions = require('reify/lib/parsers/babel.js').options;

// TODO: it would be better to have Babel compile the file first
// instead of handling some plugins specially, but that would
// require copying a large amount of code from Meteor's babel compiler
const { resolvePath } = require('babel-plugin-module-resolver');
const { visit } = require('ast-types');

function findBabelConfig(startDir, appDir) {
  const babelRcPath = path.join(startDir, '.babelrc');
  const packageJsonPath = path.join(startDir, 'package.json');
  if (fs.existsSync(babelRcPath)) {
    return [babelRcPath, 'babelrc'];
  }

  if (fs.existsSync(packageJsonPath)) {
    return [packageJsonPath, 'package.json'];
  }

  const parentDir = path.resolve(startDir, '..');
  if (!parentDir.includes(appDir)) {
    return [];
  }

  return findBabelConfig(parentDir, appDir);
}

function findModuleResolveConfig(filePath, appDir) {
  const fileDir = path.dirname(filePath);
  const [babelConfigPath, type] = findBabelConfig(fileDir, appDir);
  // console.error(`babelConfigPath`, babelConfigPath);
  if (babelConfigPath) {
    const babelConfigContent = fs.readFileSync(babelConfigPath, 'utf-8');
    // TODO: error handling
    const babelConfig = JSON.parse(babelConfigContent);
    if (type === 'package.json' && !babelConfig.babel) {
      return null;
    }
    const moduleResolvePluginConfig =
      babelConfig && babelConfig.plugins && babelConfig.plugins.find((plugin) => plugin[0] === 'module-resolver') ||
      [];
    return moduleResolvePluginConfig[1];
  }
}

function precompileTypeScript(filePath, fileContent) {
  if (filePath && !filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) {
    throw new Error("Trying to precompile a non TS file");
  }

  const ts = require("typescript");
  try {
    return ts.transpileModule(fileContent, {
      filePath,
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        // Leave module syntax intact so that Babel/Reify can handle it.
        module: ts.ModuleKind.ESNext,
        // This used to be false by default, but appears to have become
        // true by default around the release of typescript@3.7. It's
        // important to disable this option because enabling it allows
        // TypeScript to use helpers like __importDefault, which are much
        // better handled by Babel/Reify later in the pipeline.
        esModuleInterop: false,
        sourceMap: false,
        inlineSources: false,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        jsx: ts.JsxEmit.React,
      }
    });
  } catch (e) {
    e.message = `While compiling ${filePath}: ${e.message}`;
    throw e;
  }
}

module.exports = function readAndParse(filePath) {
  if (!filePath) {
    throw Error("Missing file path");
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const isTsFile = filePath.endsWith(".ts") || filePath.endsWith("tsx");
  const codeContent = isTsFile ? precompileTypeScript(filePath, fileContent).outputText : fileContent;

  return parse(codeContent, {
    parser: {
      parse: (source) =>
        meteorBabelParser(source, {
          ...defaultParserOptions,
          tokens: true,
        }),
    },
  });
};

module.exports.findImports = function findImports(filePath, ast, appDir) {
  const moduleResolveConfig = findModuleResolveConfig(filePath, appDir);
  const result = [];

  // TODO: handle require
  visit(ast, {
    visitImportDeclaration(nodePath) {
      let importPath = nodePath.value.source.value;
      if (moduleResolveConfig) {
        const origPath = importPath;
        importPath =
          resolvePath(importPath, filePath, {
            ...moduleResolveConfig,
            cwd: appDir,
          }) || origPath;
      }
      result.push({
        source: importPath,
        specifiers: nodePath.value.specifiers,
      });
      return false;
    },
    visitExportNamedDeclaration(nodePath) {
      if (!nodePath.node.source) {
        return false;
      }

      let importPath = nodePath.node.source.value;
      if (moduleResolveConfig) {
        const origPath = importPath;
        importPath =
          resolvePath(importPath, filePath, {
            ...moduleResolveConfig,
            cwd: appDir,
          }) || origPath;
      }
      result.push({
        source: importPath,
      });
      return false;
    },
    visitCallExpression(nodePath) {
      const isImport = nodePath.node.callee.type === 'Import';
      const isRequire = nodePath.node.callee.name && nodePath.node.callee.name.toLowerCase() === "require";
      if (!isImport && !isRequire) {
        return this.traverse(nodePath);
      }

      if (nodePath.node.arguments[0].type !== 'StringLiteral') {
        throw new Error(`Unable to handle non-string dynamic imports at ${filePath}`);
      }

      let importPath = nodePath.node.arguments[0].value;
      if (moduleResolveConfig) {
        const origPath = importPath;
        importPath =
          resolvePath(importPath, filePath, {
            ...moduleResolveConfig,
            cwd: appDir,
          }) || origPath;
      }
      result.push({
        source: importPath,
      });
      this.traverse(nodePath);
    },
  });

  return result;
};
