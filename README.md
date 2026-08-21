# @savaryna/add-git-account

🔐 A small CLI app that allows you to easily add multiple Git accounts on one machine. It switches between accounts automatically based on the workspace you are in.

## Agent usage (skill)

Add the skill using

```shell
npx skills add savaryna/git-add-account
```

and ask your agent to "add a new git account".

## CLI usage

Run the command direcly with

```shell
npx @savaryna/git-add-account
```

or if you installed it globally with

```shell
npm i -g @savaryna/git-add-account
```

then you can run it using

```shell
git-add-account
# or the shorter version
gaa
```

For usage and command details run it with the `--help` option.

The `add` command also supports these options:

- `--non-interactive` runs without prompts. Provide all required options.
- `--dry-run` previews the config files without writing them to disk.

After going through all the steps, you will be presented with your public SSH key so you can copy, and add it to your Git provider. For example GitHub[^1]:

1. Copy the public SSH key.
1. Go to the [SSH keys settings page](https://github.com/settings/keys).
1. Click on `New SSH key`.
1. Add the key as an `Authentication Key`.
1. Click on `Add SSH key`.
1. Add the same key again as a `Signing Key` if you chose to sign your work[^2].

Done! Any `git` command you run from the workspace you chose **(and its subdirectories)**, will now use this new account automatically.

## How it works

A simple way to use multiple Git accounts on one machine is to use different SSH configs based on the directory you are in. The way [@savaryna/add-git-account](https://www.npmjs.com/package/@savaryna/git-add-account) works is, it asks you for some basic information and then it creates files under `.config/` in the workspace directory you specified.

1. It creates a private/public `ed25519` SSH keypair using `ssh-keygen` ([see code](https://github.com/savaryna/git-add-account/blob/main/src/helpers/config.ts#L28-L29)).
1. It creates a `sshconfig` file based on this [template](https://github.com/savaryna/git-add-account/blob/main/src/templates/sshconfig.mustache).
1. It creates a `gitconfig` file based on this [template](https://github.com/savaryna/git-add-account/blob/main/src/templates/gitconfig.mustache).
1. It appends a conditional include to your global Git config based on this [template](https://github.com/savaryna/git-add-account/blob/main/src/templates/gitconfig.global.mustache). This makes sure that any `git` command you run from the workspace you chose **(and its subdirectories)**, will now use this new account automatically[^3].
1. Finally, it presents you with your public SSH key so you can copy, and add it to your Git provider.

## License

[MIT](LICENSE) &copy; [Alex Tofan](https://github.com/savaryna)

[^1]: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account?tool=webui
[^2]: https://docs.github.com/en/authentication/managing-commit-signature-verification
[^3]: https://git-scm.com/docs/git-config#_conditional_includes
