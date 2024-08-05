const { access, constants, mkdir, readFile, rm, writeFile } = require('fs');
const { homedir, platform } = require('os');
const { promisify } = require('util');
const { resolve } = require('path');

module.exports.createFile = (path, data) => promisify(writeFile)(path, data, 'utf8');

module.exports.readFile = promisify(readFile);

module.exports.home = homedir();

module.exports.platform = platform();

module.exports.mkdir = promisify(mkdir);

module.exports.remove = (path) => promisify(rm)(path, { recursive: true, force: true });

module.exports.resolve = resolve;

module.exports.hasReadWriteAccess = (path) =>
  promisify(access)(path, constants.R_OK | constants.W_OK).then(
    () => true,
    () => false
  );
