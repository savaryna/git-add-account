const { default: exec } = require('./exec');

module.exports.fileExists = (path) =>
  exec(`ls ${path}`).then(
    () => true,
    () => false
  );
