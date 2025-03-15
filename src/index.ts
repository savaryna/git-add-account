#!/usr/bin/env node

import mustache from 'mustache';

import sshConfigTemplate from './templates/sshconfig.mustache';
import gitConfigTemplate from './templates/gitconfig.mustache';

import exec from './helpers/exec';
import { createFile, hasReadWriteAccess, platform, mkdir, readFile, remove } from './helpers/file';
import prompts, { overwritePathPrompt, exit } from './helpers/prompts';

async function main() {
  const { name, email, host, workspace, signYourWork } = await prompts();

  // Check already existing workspace config
  if (await hasReadWriteAccess(workspace.config)) {
    const { overwrite } = await overwritePathPrompt(workspace.config);

    if (overwrite) {
      await remove(workspace.config);
    } else {
      exit(1);
    }
  }

  // Create workspace/config dir
  await mkdir(workspace.config, { recursive: true });

  // Generate ssh key
  await exec(`ssh-keygen -t ed25519 -C "${email}" -f ${workspace.privateKey}`);

  // Use keychain if the system is MacOS and a passphrase was used
  const useKeychain = await exec(`ssh-keygen -y -P "" -f ${workspace.privateKey}`)
    .then(
      () => false,
      () => true
    )
    .then((hasPassphrase) => hasPassphrase && platform() === 'darwin');

  // Create sshconfig for the workspace
  const sshConfig = mustache.render(sshConfigTemplate, {
    email,
    host,
    useKeychain,
    workspace
  });

  await createFile(workspace.sshConfig, sshConfig);

  // Create gitconfig for the workspace
  const gitConfig = mustache.render(gitConfigTemplate, {
    name,
    email,
    workspace,
    signYourWork
  });

  await createFile(workspace.gitConfig, gitConfig);

  // Include workspace config in the global config
  await exec(`git config --global includeIf.gitdir:${workspace.root}/.path ${workspace.gitConfig}`);

  const publicKey = await readFile(workspace.publicKey).then((buffer) => buffer.toString().trim());

  console.log('\nYour public SSH key is:\n', publicKey);
  console.log('You can also find it here:\n', workspace.publicKey);
  console.log('Add it to your favorite GIT provider and enjoy!');
}

main()
  .then(() => exit())
  .catch((error) => exit(1, error.message));
