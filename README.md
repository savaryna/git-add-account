# @savaryna/add-git-account

🔐 A small CLI app that allows you to easily add multiple GIT accounts on one machine. It switches between accounts automatically based on the workspace _(directory/subdirectory)_ you are in.

## Usage

Run the command direcly with

```shell
npx @savaryna/git-add-account
```

or if you want, first install it globally

```shell
npm i -g @savaryna/git-add-account
```

then you can run it using

```shell
git-add-account
```

or

```shell
gaa
```

After going through all the steps, you will be presented with your public SSH key so you can copy, and add it to your GIT provider. For example GitHub[^1]:

1. Go to your account [settings / keys](https://github.com/settings/keys)
1. Click on `New SSH key`
1. Give it a title
1. Choose `Authentication Key` for key type
1. Paste in the public SSH key copied earlier in the key field
1. Click on `Add SSH key`
1. Repeat steps **2 through 6** to add a `Signing Key` key type, if you chose to sign your work (Commits, Tags, Pushes)[^2]
1. Done! Now, you can go to the workspace you chose for the account, ex: `cd /Users/john/code/work`, and all the `git`
   commands issued from this, **or any other subdirectory**, will automatically use the correct account/ssh keys.

## Example of how it works

A simple way to use multiple git accounts on one machine is to use different SSH configs based on the directory you are in. The way [@savaryna/add-git-account](https://www.npmjs.com/package/@savaryna/git-add-account) works is, it asks you for some basic information and then it creates some files under `.config` in the workspace directory you specified. Ex:

1. It creates a _(private/public)_ SSH keypair using `ssh-keygen -t ed25519 -C "john@github.com" -f /Users/john/code/work/.config/id_ed25519_git_github_com`. [See code](https://github.com/savaryna/git-add-account/blob/main/src/index.ts#L29-L30).
1. It creates a `sshconfig` file. [See code](https://github.com/savaryna/git-add-account/blob/main/src/index.ts#L40-L48).

   ```ini
   # File at /Users/john/code/work/.config/sshconfig
   # Config for GIT account john@github.com
   Host github.com
     HostName github.com
     User git
     AddKeysToAgent yes
     UseKeychain yes
     IdentitiesOnly yes
     IdentityFile /Users/john/code/work/.config/id_ed25519_git_github_com
   ```

1. It creates a `gitconfig` file. [See code](https://github.com/savaryna/git-add-account/blob/main/src/index.ts#L50-L58).

   ```ini
   # File at /Users/john/code/work/.config/gitconfig
   # Config for GIT account john@github.com
   [user]
     name = John Doe
     email = john@github.com
   [core]
     sshCommand = ssh -F /Users/john/code/work/.config/sshconfig
   [gpg]
     format = ssh
   [commit]
     gpgsign = true
   [push]
     gpgsign = if-asked
   [tag]
     gpgsign = true
   [user]
     signingkey = /Users/john/code/work/.config/id_ed25519_git_github_com
   ```

1. It runs `git config --global includeIf.gitdir:/Users/john/code/work/.path /Users/john/code/work/.config/gitconfig`, this makes sure that as long as you are in the workspace created earlier, **or any other subdirectory**, git will use the config from step **3** automatically[^3]. [See code](https://github.com/savaryna/git-add-account/blob/main/src/index.ts#L60-L61).
1. And finally, it presents you with your public SSH key so you can copy it and add it to your GIT provider of choice.

## License

[MIT](LICENSE) &copy; [Alex Tofan](https://github.com/savaryna)

[^1]: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account?tool=webui
[^2]: https://docs.github.com/en/authentication/managing-commit-signature-verification
[^3]: https://git-scm.com/docs/git-config#_conditional_includes
