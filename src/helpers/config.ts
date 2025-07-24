import { exec } from 'node:child_process';
import { existsSync, type PathLike } from 'node:fs';
import { appendFile, mkdir, readFile, rm } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import mustache from 'mustache';

import gitConfigGlobalTemplate from '@/templates/gitconfig.global.mustache';
import gitConfigTemplate from '@/templates/gitconfig.mustache';
import sshConfigTemplate from '@/templates/sshconfig.mustache';

import validate, { z } from './validate';

const execAsync = promisify(exec);

async function getKeys(configDetails: ConfigDetails) {
  const keyName = `id_ed25519_git_${configDetails.host}`;
  const privateKeyName = keyName;
  const publicKeyName = `${keyName}.pub`;

  const privateKeyPath = resolve(tmpdir(), privateKeyName);
  const publicKeyPath = resolve(tmpdir(), publicKeyName);

  await rm(privateKeyPath, { force: true });
  await rm(publicKeyPath, { force: true });

  await execAsync(`ssh-keygen -t ed25519 -C "${configDetails.email}" -f ${privateKeyPath} -N ""`);

  const privateKey = await readFile(privateKeyPath, 'utf8');
  const publicKey = await readFile(publicKeyPath, 'utf8');

  await rm(privateKeyPath, { force: true });
  await rm(publicKeyPath, { force: true });

  return {
    privateKeyName,
    publicKeyName,
    privateKey,
    publicKey,
  };
}

export const ConfigDetails = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  host: z.string().refine((host) => host.includes('.') && URL.canParse(`https://${host}`), {
    message: 'Invalid host, must be a valid domain (e.g., github.com)',
  }),
  workspace: z
    .string()
    .min(1)
    .refine((path) => !existsSync(path), 'Path already exists'),
  signYourWork: z.boolean(),
});

export type ConfigDetails = z.infer<typeof ConfigDetails>;

export type ConfigFile = {
  path: PathLike;
  content: string;
  secret?: boolean;
};

export type ConfigFiles = Record<
  'gitConfigGlobal' | 'gitConfig' | 'sshConfig' | 'privateKey' | 'publicKey',
  ConfigFile
>;

export async function getConfigs(configDetails: ConfigDetails): Promise<ConfigFiles> {
  const errors = validate(ConfigDetails, configDetails);
  if (errors) throw new Error(errors);

  const keys = await getKeys(configDetails);

  const workspace = resolve(configDetails.workspace);
  const config = resolve(workspace, '.config');

  const paths = {
    workspace,
    config,
    gitConfigGlobal: resolve(homedir(), '.gitconfig'),
    gitConfig: resolve(config, 'gitconfig'),
    sshConfig: resolve(config, 'sshconfig'),
    privateKey: resolve(config, keys.privateKeyName),
    publicKey: resolve(config, keys.publicKeyName),
  };

  return {
    gitConfigGlobal: {
      path: paths.gitConfigGlobal,
      content: mustache.render(gitConfigGlobalTemplate, {
        configDetails,
        paths,
      }),
    },
    gitConfig: {
      path: paths.gitConfig,
      content: mustache.render(gitConfigTemplate, { configDetails, paths }),
    },
    sshConfig: {
      path: paths.sshConfig,
      content: mustache.render(sshConfigTemplate, { configDetails, paths }),
    },
    privateKey: {
      path: paths.privateKey,
      content: keys.privateKey,
      secret: true,
    },
    publicKey: {
      path: paths.publicKey,
      content: keys.publicKey,
    },
  };
}

export async function writeConfigs(configDetails: ConfigDetails, configs: ConfigFiles) {
  const config = resolve(configDetails.workspace, '.config');
  await mkdir(config, { recursive: true });
  const files = Object.values(configs).map(({ path, content, secret }) =>
    appendFile(path, content, {
      encoding: 'utf8',
      mode: secret ? 0o600 : 0o644,
    }),
  );
  await Promise.all(files);
}
