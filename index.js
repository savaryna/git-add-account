#!/usr/bin/env node

const { default: exec } = require('./helpers/exec');
const { fileExists } = require('./helpers/file');
const { default: prompts, exit } = require('./helpers/prompts');
const { default: validate, z } = require('./helpers/validate');

const sshDir = '~/.ssh/';

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
      initial: (email) => `~/code/${email.domain}`,
      validate: validate(z.string()),
    },
  ]);

  if (await fileExists(`${workspace}/.gitconfig`)) {
    const { overwrite } = await overwriteFilePrompt(`${workspace}/.gitconfig`);

    if (overwrite) {
      await exec(`rm ${workspace}/.gitconfig`);
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

  const sshKey = `${sshDir}${sshKeyFileName}`;

  if (await fileExists(sshKey)) {
    const { overwrite } = await overwriteFilePrompt(sshKey);

    if (overwrite) {
      await exec(`rm ${sshKey}`);
    } else {
      exit(1);
    }
  }

  // Generate ssh key
  await exec(`ssh-keygen -t ed25519 -C "${email.address}" -f ${sshKey}`);

  // Check to see if the user entered a passphrase
  const hasPassphrase = await exec(`ssh-keygen -y -P "" -f ${sshKey}`).then(
    () => false,
    () => true
  );

  const sshConfig = `
    # Config for GIT account ${email.address}
    Host *
      AddKeysToAgent yes
      ${hasPassphrase ? 'UseKeychain yes' : ''}
      IdentityFile ${sshKey}
  `.replace(/\n\s{4}/g, '\n');

  // Add account to the ssh config
  await exec(`echo "${sshConfig}" >> ${sshDir}/config`);

  // Create workspace dir if it does not exist
  await exec(`mkdir -p ${workspace}`);

  // Create .gitconfig for the workspace
  await exec(`touch ${workspace}/.gitconfig`);

  // Set user details
  await exec(`git config --file ${workspace}/.gitconfig user.name "${name.original}"`);
  await exec(`git config --file ${workspace}/.gitconfig user.email "${email.address}"`);

  // Set default ssh command
  await exec(`git config --file ${workspace}/.gitconfig core.sshCommand "ssh -i ${sshKey}"`);

  const { enableSignedCommits } = await prompts({
    type: 'toggle',
    name: 'enableSignedCommits',
    message: 'Enable signed commits for this account?',
    initial: true,
    active: 'yes',
    inactive: 'no',
  });

  // Enable signed commits
  if (enableSignedCommits) {
    await exec(`git config --file ${workspace}/.gitconfig gpg.format ssh`);
    await exec(`git config --file ${workspace}/.gitconfig commit.gpgsign true`);
    await exec(`git config --file ${workspace}/.gitconfig user.signingkey ${sshKey}`);
  }

  // Include workspace config in the global config
  await exec(`git config --global includeIf.gitdir:${workspace}/.path ${workspace}/.gitconfig`);

  const publicSshKeyFile = `${sshDir}/${sshKeyFileName}.pub`
  await exec(`pbcopy < ${publicSshKeyFile}`);

  console.log('\nYour public SSH key was added to the clipboard.')
  console.log('You can also find it here: ', publicSshKeyFile)
  console.log('Add it to your favorite GIT provider and enjoy!');
}

main().then(() => exit()).catch(() => exit(1));
