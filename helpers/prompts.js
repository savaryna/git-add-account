const prompts = require('prompts');

const exit = (code = 0, reason = null) => {
  console.log(reason ? `\n${reason}\n` : '');
  console.log(`${code ? '😵 Exited.' : '✨ Done.'} Thanks for using git-add-account!\n`);
  process.exit(code);
};

module.exports.exit = exit;

module.exports.default = (questions, options) => prompts(questions, { onCancel: () => exit(1), ...options });
