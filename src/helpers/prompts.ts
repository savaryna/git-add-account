import type { PathLike } from 'node:fs';
import defaultPrompts from 'prompts';
import exec from './exec';
import { home, resolve } from './file';
import validate, { z } from './validate';

type Name = {
  value: string;
  camel: string;
};

type Host = {
  value: string;
  camel: string;
};

type Workspace = {
  root: string;
  config: string;
  gitConfig: string;
  sshConfig: string;
  privateKey: string;
  publicKey: string;
};

export const MIN_GIT_VERSION = '2.34.0'; // Lower versions don't support SSH for GPG signing

export const getGitVersion = () =>
  exec('git --version').then(({ stdout }) => stdout.split(' ')[2]);

export const exit = (code = 0, reason = null) => {
  console.log(reason ? `\n${reason}\n` : '');
  console.log(
    `${code ? '😵 Exited.' : '✨ Done.'} Thanks for using @savaryna/git-add-account!\n`,
  );
  process.exit(code);
};

// Add onCancel handler for all prompts
export const prompts = <T extends string = string>(
  questions:
    | defaultPrompts.PromptObject<T>
    | Array<defaultPrompts.PromptObject<T>>,
  options?: defaultPrompts.Options,
) => defaultPrompts(questions, { onCancel: () => exit(1), ...options });

export const overwritePathPrompt = (path: PathLike) =>
  prompts({
    type: 'toggle',
    name: 'overwrite',
    message: `Path ${path} already exists. Overwrite?`,
    initial: false,
    active: 'yes',
    inactive: 'no',
  }) as Promise<{
    overwrite: boolean;
  }>;

export default async () => {
  const gitVersion = await getGitVersion();

  return prompts([
    {
      type: 'text',
      name: 'name',
      message: 'Your name:',
      validate: validate(z.string()),
      format: (value): Name => ({
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
          .transform((h) => `https://${h}`)
          .refine(URL.canParse, { message: 'Invalid host' }),
      ),
      format: (value): Host => ({
        value,
        camel: value.replace(/[^\w]/g, '_'),
      }),
    },
    {
      type: 'text',
      name: 'workspace',
      message: 'Workspace to use for this account:',
      initial: (host) => resolve(home(), 'code', host.camel),
      validate: validate(
        z.string().refine((value) => !value.startsWith('~'), {
          message: '"~" is not supported',
        }),
      ),
      format: (value, { host }): Workspace => {
        const root = resolve(home(), value);
        const config = resolve(root, '.config');
        const sshKeyFileName = `id_ed25519_git_${host.camel}`;

        return {
          root,
          config,
          gitConfig: resolve(config, 'gitconfig'),
          sshConfig: resolve(config, 'sshconfig'),
          privateKey: resolve(config, sshKeyFileName),
          publicKey: resolve(config, `${sshKeyFileName}.pub`),
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
      type: (prev) => (prev && gitVersion < MIN_GIT_VERSION ? 'toggle' : null),
      name: 'signYourWork',
      initial: true,
      message: `Your current git version (${gitVersion}) does not support SSH signing. Continue without?`,
      active: 'yes',
      inactive: 'no',
      format: (value) => (value ? !value : exit(1)),
    },
  ]) as Promise<{
    name: Name;
    email: string;
    host: Host;
    workspace: Workspace;
    signYourWork: boolean;
  }>;
};
