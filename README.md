# @savaryna/add-git-account

🔐 A small CLI app that allows you to easily add multiple GIT accounts on one machine. It switches between accounts automatically based on the workspace (directory) you are in.

## Usage

Run the command direcly:
```shell
npx @savaryna/git-add-account
```

or if you want to install it globally:

```shell
npm i -g @savaryna/git-add-account

# now you can run it by invoking
git-add-account

# or
gaa
```

After going through all the steps:

```shell
✔ Name to use for this account: … Example Name
✔ Email to use for this account: … example@email.com
✔ Workspace to use for this account: … /Users/savaryna/code/email
✔ Name to use for SSH keys: … email_example_name
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
✔ Do you want to sign your work? … no / yes

Your public SSH key is:  ssh-ed25519 AAAAC3NlZ...DITJheGo example@email.com
You can also find it here:  /Users/savaryna/.ssh/git_email_example_name.pub
Add it to your favorite GIT provider and enjoy!

✨ Done. Thanks for using @savaryna/git-add-account!
```

You will be presented with your public SSH key so you can copy, and add it to your GIT provider. For example GitHub[^1]:

1. Go to your account [settings / keys](https://github.com/settings/keys)
2. Click on `New SSH key`
3. Give it any title
4. Choose `Authentication Key` for key type
4. Paste in the public SSH key copied earlier in the key field
5. Repeat steps 2 - 4 to add a `Signing Key` key type, if you chose to sign your work (Commits, Tags, Pushes)[^2]
6. Done! Now you can go to the workspace you chose for the account `/Users/savaryna/code/email` in this example, and all the GIT
commands issued from this and children directories will automatically use the correct account.

## How it works

A simple way to use multiple git accounts on one machine is to use multiple SSH keys configured with different hosts. The way [@savaryna/add-git-account](https://www.npmjs.com/package/@savaryna/git-add-account) works is, it asks you for some basic information and then:

1. It creates a `.gitconfig` file in the workspace directory you specified.
2. It creates a SSH keypair using `ssh-keygen -t ed25519 -C "email@you.specified" -f ~/.ssh/git_the_ssh_key_name_you_specified`.
3. It appends to the `~/.ssh/config` file.
    ```ini
    # Config for GIT account email@you.specified
    Host *
      AddKeysToAgent yes
      UseKeychain yes
      IdentityFile path/to/the/SSH/key/created/in/step/2
    ```
4. It runs `git config --file path/to/.gitconfig/from/step/1 user.name "name_you_specified"` to set your git username.
5. It runs `git config --file path/to/.gitconfig/from/step/1 user.email "email@you.specified"` to set your git email.
6. It runs `git config --file path/to/.gitconfig/from/step/1 core.sshCommand "ssh -i path/to/the/SSH/key/created/in/step/2"` to make sure all the commands issued from this workspace use the correct SSH key.
7. If you chose to sign your work:
    1. It runs `git config --file path/to/.gitconfig/from/step/1 gpg.format ssh` to use SSH key for signing.
    2. It runs `git config --file path/to/.gitconfig/from/step/1 commit.gpgsign true` to enable signing commits.
    3. It runs `git config --file path/to/.gitconfig/from/step/1 push.gpgsign if-asked` to enable signing pushes if supported.
    4. It runs `git config --file path/to/.gitconfig/from/step/1 tag.gpgsign true` to enable signing tags.
    5. It runs `git config --file path/to/.gitconfig/from/step/1 user.signingkey path/to/the/SSH/key/created/in/step/2` to set the signing key to the one created in step 2.
8. It runs `git config --global includeIf.gitdir:path/to/your/workspace/.path $path/to/.gitconfig/from/step/1`, this makes sure that if you are in the workspace for the created account, git will use the config from step 1 with all the options from the step 5, 6 and 7 automatically.
9. And finally it presents you with your public SSH key so you can copy it and add it to your GIT provider of choice.


## License

[MIT](LICENSE) &copy; [Alex Tofan](https://github.com/savaryna)

[^1]: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account?tool=webui
[^2]: https://docs.github.com/en/authentication/managing-commit-signature-verification
