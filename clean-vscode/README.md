# `clean-vscode`

## 🪄 Function

Clean up unnecessary files and directories under `.vscode-server`.

## 📖 Usage

It is highly recommended to run the script with `--dry-run` option first to see what will be removed.

```bash
./clean-vscode.sh --dry-run
```

If you are satisfied with the result, you can run the script without `--dry-run` option.

```bash
./clean-vscode.sh
```

If you want to clean up for all users, run the script with `sudo` and `--all-users` option.

```bash
sudo ./clean-vscode.sh --all-users
```

## 🍻 Example

```bash
$ ./clean-vscode.sh
Processing /home/ubuntu/.vscode-server...
  *Directory size before clean: 1.5G
  Removing pid & token files...
  Removing log files...
  Removing old versions of vscode-server binary...
rm: missing operand
Try 'rm --help' for more information.
  Cleaning data directory...
    Removing cache directory...
    Removing logs directory...
  Cleaning extensions directory...
    Removing obsolete extensions...
  Cleaning servers directory...
    Removing old versions of vscode-server directories...
  *Directory size after clean: 573M
```

## ⚠️ Warning

Only tested on Ubuntu. Use at your own risk.
