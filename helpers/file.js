const { access, appendFile, constants, mkdir, readFile, unlink, writeFile } = require('fs');
const { homedir } = require('os');
const { promisify } = require('util');
const { resolve } = require('path');

module.exports.append = promisify(appendFile);

module.exports.createEmptyFile = (path) => promisify(writeFile)(path, '');

module.exports.home = homedir();

module.exports.mkdir = promisify(mkdir);

module.exports.readFile = promisify(readFile);

module.exports.remove = promisify(unlink);

module.exports.resolve = resolve;

module.exports.hasReadWriteAccess = (path) =>
  promisify(access)(path, constants.R_OK | constants.W_OK).then(
    () => true,
    () => false
  );
