import p from 'prompts';

export const exit = (code = 0) => {
  console.log(`\n${code ? '😵 Exiting.' : '✨ Done.'} Thanks for using git-add-account!\n`);
  process.exit(code);
};

export default (prompts, options) => p(prompts, { onCancel: () => exit(1), ...options });
