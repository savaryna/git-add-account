#!/usr/bin/env node

const { default: exec } = require('./helpers/exec');
const { createFile, hasReadWriteAccess, platform, mkdir, readFile, remove } = require('./helpers/file');
const { default: prompts, overwritePathPrompt, exit } = require('./helpers/prompts');

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
    .then((hasPassphrase) => hasPassphrase && platform === 'darwin');

  // Create sshconfig for the workspace
  const sshConfig = `
    # Config for GIT account ${email}
    Host ${host.value}
      HostName ${host.value}
      User git
      AddKeysToAgent yes
      ${useKeychain ? 'UseKeychain yes' : ''}
      IdentitiesOnly yes
      IdentityFile ${workspace.privateKey}
  `.replace(/\n\s{4}/g, '\n');

  await createFile(workspace.sshConfig, sshConfig);

  // Create gitconfig for the workspace
  const gitConfig = `
    # Config for GIT account ${email}
    [user]
      name = ${name.value}
      email = ${email}
    [core]
      sshCommand = ssh -F ${workspace.sshConfig}
    ${
      !signYourWork
        ? ''
        : `
    [gpg]
      format = ssh
    [commit]
      gpgsign = true
    [push]
      gpgsign = if-asked
    [tag]
      gpgsign = true
    [user]
      signingkey = ${workspace.privateKey}
    `
    }
  `.replace(/\n\s{4}/g, '\n');

  await createFile(workspace.gitConfig, gitConfig);

  // Include workspace config in the global config
  await exec(`git config --global includeIf.gitdir:${workspace.root}/.path ${workspace.gitConfig}`);

  const publicKey = await readFile(workspace.publicKey).then((buffer) => buffer.toString().trim());

  console.log('\nYour public SSH key is: ', publicKey);
  console.log('You can also find it here: ', workspace.publicKey);
  console.log('Add it to your favorite GIT provider and enjoy!');
}

main()
  .then(() => exit())
  .catch((error) => exit(1, error.message));
