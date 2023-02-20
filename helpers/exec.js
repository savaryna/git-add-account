const { exec } = require('child_process');
const { promisify } = require('util');

module.exports.default = promisify(exec);
