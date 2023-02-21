#!/usr/bin/env node

const { default: exec } = require('./helpers/exec');
const { append, createEmptyFile, hasReadWriteAccess, home, mkdir, readFile, remove, resolve } = require('./helpers/file');
const { default: prompts, exit } = require('./helpers/prompts');
const { default: validate, z } = require('./helpers/validate');

const sshDirPath = resolve(home, '.ssh');
const sshConfigPath = resolve(sshDirPath, 'config');

const overwriteFilePrompt = (path) =>
  prompts({
    type: 'toggle',
    name: 'overwrite',
    message: `File ${path} already exists. Overwrite?`,
    initial: false,
    active: 'yes',
    inactive: 'no',
  });

async function main() {
  const { name, email, workspace } = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'Name to use for this account:',
      validate: validate(z.string()),
      format: (value) => ({
        original: value,
        camel: value.toLowerCase().replace(/[^\w]/g, '_'),
      }),
    },
    {
      type: 'text',
      name: 'email',
      message: 'Email to use for this account:',
      validate: validate(z.string().email()),
      format: (value) => ({
        address: value,
        domain: value.match(/(?<=@).+(?=\.)/)[0].replace(/[^\w]/g, '_'),
      }),
    },
    {
      type: 'text',
      name: 'workspace',
      message: 'Workspace to use for this account:',
      initial: (email) => resolve(home, `code/${email.domain}`),
      validate: validate(z.string()),
    },
  ]);

  const workspaceGitConfigPath = resolve(workspace, '.gitconfig');

  if (await hasReadWriteAccess(workspaceGitConfigPath)) {
    const { overwrite } = await overwriteFilePrompt(workspaceGitConfigPath);

    if (overwrite) {
      await remove(workspaceGitConfigPath);
    } else {
      exit(1);
    }
  }

  const { sshKeyFileName } = await prompts([
    {
      type: 'text',
      name: 'sshKeyFileName',
      message: 'Name to use for SSH keys:',
      initial: `${email.domain}_${name.camel}`,
      validate: validate(z.string()),
      format: (value) => `git_${value}`,
    },
  ]);

  const sshKeyPath = resolve(sshDirPath, sshKeyFileName);

  if (await hasReadWriteAccess(sshKeyPath)) {
    const { overwrite } = await overwriteFilePrompt(sshKeyPath);

    if (overwrite) {
      await remove(sshKeyPath);
    } else {
      exit(1);
    }
  }

  // Generate ssh key
  await exec(`ssh-keygen -t ed25519 -C "${email.address}" -f ${sshKeyPath}`);

  // Check to see if the user entered a passphrase
  const hasPassphrase = await exec(`ssh-keygen -y -P "" -f ${sshKeyPath}`).then(
    () => false,
    () => true
  );

  const sshConfig = `
    # Config for GIT account ${email.address}
    Host *
      AddKeysToAgent yes
      ${hasPassphrase ? 'UseKeychain yes' : ''}
      IdentityFile ${sshKeyPath}
  `.replace(/\n\s{4}/g, '\n');

  // Add account to the ssh config
  await append(sshConfigPath, sshConfig);

  // Create workspace dir if it does not exist
  await mkdir(workspace, { recursive: true });

  // Create .gitconfig for the workspace
  await createEmptyFile(workspaceGitConfigPath);

  // Set user details
  await exec(`git config --file ${workspaceGitConfigPath} user.name "${name.original}"`);
  await exec(`git config --file ${workspaceGitConfigPath} user.email "${email.address}"`);

  // Set default ssh command
  await exec(`git config --file ${workspaceGitConfigPath} core.sshCommand "ssh -i ${sshKeyPath}"`);

  const { signYourWork } = await prompts({
    type: 'toggle',
    name: 'signYourWork',
    message: 'Do you want to sign your work?',
    initial: true,
    active: 'yes',
    inactive: 'no',
  });

  // Enable signing
  if (signYourWork) {
    await exec(`git config --file ${workspaceGitConfigPath} gpg.format ssh`);
    await exec(`git config --file ${workspaceGitConfigPath} commit.gpgsign true`);
    await exec(`git config --file ${workspaceGitConfigPath} push.gpgsign if-asked`);
    await exec(`git config --file ${workspaceGitConfigPath} tag.gpgsign true`);
    await exec(`git config --file ${workspaceGitConfigPath} user.signingkey ${sshKeyPath}`);
  }

  // Include workspace config in the global config
  await exec(`git config --global includeIf.gitdir:${workspace}/.path ${workspaceGitConfigPath}`);

  const publicSshKeyPath = resolve(sshDirPath, `${sshKeyFileName}.pub`);
  // await exec(`pbcopy < ${publicSshKeyPath}`);
  const publicSshKey = await readFile(publicSshKeyPath).then((buffer) => buffer.toString().trim());

  console.log('\nYour public SSH key is: ', publicSshKey);
  console.log('You can also find it here: ', publicSshKeyPath);
  console.log('Add it to your favorite GIT provider and enjoy!');
}

main()
  .then(() => exit())
  .catch((error) => exit(1, error.message));
