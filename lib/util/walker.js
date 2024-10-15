const fs = require('fs');
const path = require('path');
const readAndParse = require('./parse');
const { debug } = require("./utilities");
const ignore = require('ignore');

// TODO: the order is important
// extensions of files that are compiled into js
// and can import other js files.
const parseableExt = ['.js', '.jsx', '.svelte', '.ts', '.tsx'];

// These folders are not eagerly loaded by Meteor
// TODO: check if we should only exclude some of these when
// they are at the top level
const notEagerlyLoadedDirs = [
  'imports',
  'node_modules',
  'public',
  // TODO: have an option to include tests
  'tests',
  'test',
  'packages',
  'private',
];

// The path will start with one of these if
// it imports an app file
const appFileImport = ['.', path.posix.sep, path.win32.sep];

let ig;
try {
  ig = ignore().add(fs.readFileSync('.eslintignore').toString());
} catch (e) {
  ig = ignore();
}

function shouldWalk(folderPath, archList) {
  const basename = path.basename(folderPath);
  if (basename[0] === '.' || notEagerlyLoadedDirs.includes(basename)) {
    return false;
  }

  const parts = folderPath.split(path.sep);
  if (!archList.includes('server') && parts.includes('server')) {
    return false;
  }
  if (!archList.includes('client') && parts.includes('client')) {
    return false;
  }

  return true;
}

function findExt(filePath) {
  const ext = parseableExt.find((possibleExt) => {
    return fs.existsSync(filePath + possibleExt);
  });

  if (ext) {
    return filePath + ext;
  }

  // Maybe it is the index file in a folder
  // TODO: check if this should be before or after checking extensions
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      return findExt(`${filePath}${path.sep}index`);
    }
  } catch (e) {
    // TODO: only ignore certain errors
  }
}

function shouldParse(filePath) {
  const ext = path.extname(filePath);
  const basename = path.basename(filePath);

  // TODO: have an option to parse test files
  if (
    basename.endsWith(`.app-tests${ext}`) ||
    basename.endsWith(`.spec${ext}`) ||
    basename.endsWith(`.test${ext}`)
  ) {
    return false;
  }

  return basename[0] !== '.' && parseableExt.includes(ext);
}

function isMeteorPackage(importPath) {
  return importPath.startsWith('meteor/');
}

function isNpmDependency(importPath) {
  return !appFileImport.includes(importPath[0]);
}

const handledFiles = new Set();

function getAbsFilePath(filePath) {
  // some files have no ext or are only the ext (.gitignore, .editorconfig, etc.)
  const existingExt =
    path.extname(filePath) || path.basename(filePath).startsWith('.');

  if (!existingExt || !parseableExt.includes(existingExt)) {
    // TODO: should maybe only do this if a file doesn't exists with the given path
    // since we might be importing a file with no extension.
    return findExt(filePath);
  }

  // TODO: if the file doesn't exist, we must try other extensions

  return filePath;
}

function handleFile(_filePath, appPath, onFile, cachedParsedFile) {
  const filePath = getAbsFilePath(_filePath);
  if (!filePath) {
    return;
  }

  const relativeFilePath = path.relative(process.cwd(), filePath);
  if (!shouldParse(filePath) || handledFiles.has(filePath) || ig.ignores(relativeFilePath)) {
    return;
  }

  handledFiles.add(filePath);

  const realPath = fs.realpathSync.native(filePath);
  if (cachedParsedFile[realPath]) {
    return;
  }
  const ast = readAndParse(filePath);
  cachedParsedFile[realPath] = true;
  // console.debug('Set key', realPath);

  const imports = readAndParse.findImports(filePath, ast, appPath);
  onFile({ path: filePath, ast, imports });

  imports
    .filter(
      ({ source }) => !isMeteorPackage(source) && !isNpmDependency(source)
    )
    .map(({ source }) => {
      if (source[0] === '/') {
        source = appPath + source;
      }
      return path.resolve(path.dirname(filePath), source);
    })
    .forEach((importPath) => {
      handleFile(importPath, appPath, onFile, cachedParsedFile);
    });
}

function handleFolder(folderPath, appPath, archList, onFile, cachedParsedFile) {
  const dirents = fs.readdirSync(folderPath, { withFileTypes: true });
  for (let i = 0; i < dirents.length; i += 1) {
    if (dirents[i].isDirectory()) {
      if (shouldWalk(path.resolve(folderPath, dirents[i].name), archList)) {
        handleFolder(
          path.resolve(folderPath, dirents[i].name),
          appPath,
          archList,
          onFile,
          cachedParsedFile
        );
      }
    } else if (dirents[i].isFile()) {
      const filePath = path.resolve(folderPath, dirents[i].name);
      handleFile(filePath, appPath, onFile, cachedParsedFile);
    }
  }
}

function wasCreatedBySpecificFunction({ context, node, functionName }) {
  const variableName = node.property?.parent?.object?.name;
  const scope = context.getScope();
  const variables = scope.variables;
  const initializer = variables.find(({ name }) => name === variableName)
      ?.defs?.['0']?.parent?.declarations?.['0']?.init;

  // callee is when it's a direct usage, like find()
  // without callee is when it's indirect, like find().fetchAsync() so we get the fetchAsync() one
  const variableCalleeName = (initializer?.callee || initializer)?.property
      ?.name;
  return variableCalleeName === functionName;
}

function hasSpecificFunctionInTheChain({ node, functionName }) {
  const previousFunction = node.object.callee;
  if (!previousFunction || previousFunction.type !== 'MemberExpression') {
    return false;
  }
  return previousFunction.property.name === functionName;
}

function getInitFolder(context) {
  const optionalRootDir = context.settings?.meteor?.rootDirectories?.[0];
  return (
      (optionalRootDir && `${context.cwd}/${optionalRootDir}`) || context.cwd
  );
}

function shouldSkip(context) {
  const walker = new Walker(getInitFolder(context));

  const realPath = fs.realpathSync.native(context.physicalFilename);
  const parsedFiles = process.env.METEOR_ESLINT_PLUGIN_FILES
      ? process.env.METEOR_ESLINT_PLUGIN_FILES.split(',').reduce(
          (acc, item) => ({ ...acc, [item]: true }),
          {},
      )
      : walker.cachedParsedFile;

  if (!Object.keys(parsedFiles).length || !(realPath in parsedFiles)) {
    debug('Skipping file', realPath);
    return true;
  }
  return false;
}

const IGNORE_CACHE = !!process.env.METEOR_ESLINT_PLUGIN_IGNORE_CACHE;
const EXPIRES_CACHE_IN_SECONDS = process.env.METEOR_ESLINT_PLUGIN_EXPIRES_CACHE_IN_SECONDS || 5;

const cacheExistsAndIsStillValid = (filePath) => {
  if  (!fs.existsSync(filePath)) {
    return false;
  }

  const stats = fs.statSync(filePath);
  const mtime = new Date(stats.mtime);
  const seconds = Math.abs(new Date() - mtime) / 1000;

  return seconds <= EXPIRES_CACHE_IN_SECONDS;
}


class Walker {
  cachedParsedFile;
  appPath;

  filePath() {
    return path.join(this.appPath, '.eslint-meteor-files');
  }

  constructor(appPath) {
    this.appPath = appPath;
    const useCache = cacheExistsAndIsStillValid(this.filePath());
    if (!useCache) {
      debug('Cache is not going to be used');
    }
    this.cachedParsedFile = useCache
      ? JSON.parse(fs.readFileSync(this.filePath(), 'utf-8'))
      : {};
  }
  walkApp({ archList, onFile, isTest }) {
    if (!IGNORE_CACHE && Object.keys(this.cachedParsedFile).length > 0) {
      debug('Not walking the app as the cachedParsedFile is already present');
      return;
    }

    const packageJsonLocation = path.join(this.appPath, 'package.json');
    if (fs.existsSync(packageJsonLocation)) {
      const { meteor } = JSON.parse(fs.readFileSync(packageJsonLocation, 'utf-8'));
      if (meteor && meteor.mainModule && meteor.mainModule.server) {
        debug('Starting from meteor.mainModule.server from package.json', meteor.mainModule.server);
        handleFile(
          path.join(this.appPath, meteor.mainModule.server),
          this.appPath,
          onFile,
          this.cachedParsedFile
        );
        fs.writeFileSync(this.filePath(), JSON.stringify(this.cachedParsedFile));
        return;
      }
    }
    debug('Starting from eagerly loaded folders');

    handleFolder(
      path.join(this.appPath),
      this.appPath,
      archList,
      onFile,
      this.cachedParsedFile
    );

    fs.writeFileSync(this.filePath(), JSON.stringify(this.cachedParsedFile));
  }

  get cachedParsedFile() {
    return this.cachedParsedFile;
  }
}

module.exports = { Walker, shouldSkip, getInitFolder, hasSpecificFunctionInTheChain, wasCreatedBySpecificFunction };
