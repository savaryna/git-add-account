const prompts = require('prompts');

module.exports.exit = (code = 0) => {
  console.log(`\n${code ? '😵 Exiting.' : '✨ Done.'} Thanks for using git-add-account!\n`);
  process.exit(code);
};

module.exports.default = (questions, options) => prompts(questions, { onCancel: () => exit(1), ...options });
