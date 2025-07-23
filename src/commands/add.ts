import { homedir } from 'node:os';
import { resolve } from 'node:path';
import type { Options, PromptObject } from 'prompts';
import prompts from 'prompts';
import type { CommandModule } from 'yargs';
import { ConfigDetails, getConfigs, writeConfigs } from '@/helpers/config';
import validate from '@/helpers/validate';

export default {
  command: ['$0', 'add'],
  describe: 'Add a new Git account',
  builder: (y) =>
    y.option('dry-run', {
      type: 'boolean',
      describe: 'Preview the generated config files without writing them to disk',
    }),
  handler: async (args) => {
    console.log("Let's add a new Git account.");

    const questions: PromptObject<string>[] = [
      {
        type: 'text',
        name: 'name',
        message: 'Full name for Git commits (e.g., John Doe):',
        validate: (name) => validate(ConfigDetails.shape.name, name) || true,
      },
      {
        type: 'text',
        name: 'email',
        message: 'Email for this Git account:',
        validate: (email) => validate(ConfigDetails.shape.email, email) || true,
      },
      {
        type: 'text',
        name: 'host',
        message: 'Git provider host (e.g., github.com, gitlab.com):',
        initial: (email) => email.split('@')[1],
        validate: (host) => validate(ConfigDetails.shape.host, host) || true,
      },
      {
        type: 'text',
        name: 'workspace',
        message: 'Absolute path to the workspace for this account:',
        initial: (host) => resolve(homedir(), 'code', host),
        validate: (workspace) => validate(ConfigDetails.shape.workspace, workspace) || true,
      },
      {
        type: 'toggle',
        name: 'signYourWork',
        message: 'Sign commits and tags with your SSH key?',
        initial: true,
        active: 'yes',
        inactive: 'no',
      },
    ];

    const options: Options = {
      onCancel: () => {
        throw new Error('Operation cancelled by the user.');
      },
    };

    const configDetails = (await prompts(questions, options)) as ConfigDetails;
    const configs = await getConfigs(configDetails);

    if (args?.dryRun) {
      console.log('\nConfig files that would be generated/updated:');
      for (const config of Object.values(configs)) {
        console.log('\nPath:', config.path);
        console.log(config.secret ? '[Content hidden for security]' : config.content);
      }
    } else {
      await writeConfigs(configDetails, configs);
      console.log(`\nYour public SSH key is:\n${configs.publicKey.content}`);
      console.log(`You can also find it here:\n${configs.publicKey.path}`);
      console.log(`\nNext, add the key to ${configDetails.host}:`);
      console.log('1. Copy the public SSH key above.');
      console.log(`2. Go to the SSH keys settings page on ${configDetails.host}.`);
      console.log("3. Add the key as an 'Authentication Key'.");
      if (configDetails.signYourWork) {
        console.log("4. Add the same key again as a 'Signing Key'.");
      }
      console.log(`\nDone! Any git command you run from '${configDetails.workspace}',`);
      console.log('(and its subdirectories), will now use this new account.');
    }
  },
} as CommandModule;
