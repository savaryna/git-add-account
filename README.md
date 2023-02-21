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

## License

MIT – See [LICENSE](LICENSE) file.

[^1]: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account?tool=webui
[^2]: https://docs.github.com/en/authentication/managing-commit-signature-verification
