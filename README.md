# @savaryna/add-git-account

🔐 A small CLI app that allows you to easily add multiple GIT accounts on one machine. It switches between accounts automatically.

## Usage

Run the command
```shell
npx @savaryna/git-add-account
```

After going through all the steps

```shell
Need to install the following packages:
  @savaryna/git-add-account
Ok to proceed? (y)
✔ Name to use for this account: … Example Name
✔ Email to use for this account: … example@email.com
✔ Workspace to use for this account: … /Users/savaryna/code/email
✔ Name to use for SSH keys: … email_example_name
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
✔ Enable signed commits for this account? … no / yes

Your public SSH key is:  ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGme0weZc05wJiXUBmg4Tk0Ox1rhZP6utY48GQTJheGo example@email.com
You can also find it here:  /Users/savaryna/.ssh/git_email_example_name.pub
Add it to your favorite GIT provider and enjoy!

✨ Done. Thanks for using git-add-account!
```

Your public SSH key will automatically be added to your clipboard so you can add it to your GIT provider. For example GitHub:

1. Go to your account [settings/keys](https://github.com/settings/keys)
2. Click on `New SSH key`
3. Give it a title
4. Paste in the public SSH key
5. Repeat steps 2 - 4 to add a `Signing Key` if you chose to have signed commits
6. Done! Now you can go to the workspace you chose for the account `/Users/savaryna/code/email` in this example, and all the GIT
commands issued from this and children directories will automatically use the correct account.

## License

MIT – See [LICENSE](LICENSE) file.
