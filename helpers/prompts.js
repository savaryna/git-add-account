const { default: exec } = require('./exec');
const { home, resolve } = require('./file');
const { default: validate, z } = require('./validate');
const defaultPrompts = require('prompts');

const MIN_GIT_VERSION = '2.34.0'; // Lower versions don't support SSH for GPG signing

const getGitVersion = () => exec('git --version').then(({ stdout }) => stdout.split(' ')[2]);

const exit = (code = 0, reason = null) => {
  console.log(reason ? `\n${reason}\n` : '');
  console.log(`${code ? '😵 Exited.' : '✨ Done.'} Thanks for using @savaryna/git-add-account!\n`);
  process.exit(code);
};

// Add onCancel handler for all prompts
const prompts = (questions, options) => defaultPrompts(questions, { onCancel: () => exit(1), ...options });

const overwritePathPrompt = (path) =>
  prompts({
    type: 'toggle',
    name: 'overwrite',
    message: `Path ${path} already exists. Overwrite?`,
    initial: false,
    active: 'yes',
    inactive: 'no',
  });

const cliPrompts = () =>
  prompts([
    {
      type: 'text',
      name: 'name',
      message: 'Your name:',
      validate: validate(z.string()),
      format: (value) => ({
        value,
        camel: value.toLowerCase().replace(/[^\w]/g, '_'),
      }),
    },
    {
      type: 'text',
      name: 'email',
      message: 'Email to use for this account:',
      validate: validate(z.string().email()),
    },
    {
      type: 'text',
      name: 'host',
      message: 'Host to use for this account:',
      initial: (email) => email.split('@')[1],
      validate: validate(
        z
          .string()
          .transform((h) => 'https://' + h)
          .refine(URL.canParse, { message: 'Invalid host' })
      ),
      format: (value) => ({
        value,
        camel: value.replace(/[^\w]/g, '_'),
      }),
    },
    {
      type: 'text',
      name: 'workspace',
      message: 'Workspace to use for this account:',
      initial: (host) => resolve(home, 'code', host.camel),
      validate: validate(z.string().refine((value) => !value.startsWith('~'), { message: '"~" is not supported' })),
      format: (value, { host }) => {
        const root = resolve(home, value);
        const config = resolve(root, '.config');
        const sshKeyFileName = `id_ed25519_git_${host.camel}`;

        return {
          root,
          config,
          gitConfig: resolve(config, 'gitconfig'),
          sshConfig: resolve(config, 'sshconfig'),
          privateKey: resolve(config, sshKeyFileName),
          publicKey: resolve(config, sshKeyFileName + '.pub'),
        };
      },
    },
    {
      type: 'toggle',
      name: 'signYourWork',
      message: 'Do you want to sign your work with SSH?',
      initial: true,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: async (prev) => {
        this.gitVersion = await getGitVersion();
        return prev && this.gitVersion < MIN_GIT_VERSION ? 'toggle' : null;
      },
      name: 'signYourWork',
      message: () => `Your current git version (${this.gitVersion}) does not support SSH signing. Continue without?`,
      initial: true,
      active: 'yes',
      inactive: 'no',
      format: (value) => (value ? !value : exit(1)),
    },
  ]);

module.exports.exit = exit;

module.exports.overwritePathPrompt = overwritePathPrompt;

module.exports.default = cliPrompts;
