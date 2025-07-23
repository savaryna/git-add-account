#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import commands from '@/commands';

yargs(hideBin(process.argv))
  .scriptName('git-add-account')
  .usage('$0 [cmd] <options>')
  .command(commands)
  .demandCommand(0, 1)
  .help('h')
  .alias('h', 'help')
  .strict()
  .fail((message, error, y) => {
    if (message) {
      console.log(y.help());
    }
    console.log(`\n${message || error?.message}\n`);
    console.log('😵 Exited! Thanks for using @savaryna/git-add-account!\n');
    process.exit(1);
  })
  .parse();
