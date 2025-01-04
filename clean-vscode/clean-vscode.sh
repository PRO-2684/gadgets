# Cleans `.vscode-server` directory

dry_run=false
all_users=false
for arg in "$@"; do
    case $arg in
        --dry-run)
            # Dry run argument
            dry_run=true
            echo "Dry run enabled"
            shift
            ;;
        --all-users)
            # Run for all users argument
            all_users=true
            echo "Running for all users"
            shift
            ;;
    esac
done

# Function to clean `.vscode-server/data` directory
clean_data() {
    local data_dir="$1"
    echo "  Cleaning data directory..."
    # Removes cache directory
    echo "    Removing cache directory..."
    if [ "$dry_run" = true ]; then
        echo "      rm -rf $data_dir/CachedExtensionVSIXs"
        echo "      rm -rf $data_dir/CachedProfilesData"
    else
        rm -rf $data_dir/CachedExtensionVSIXs
        rm -rf $data_dir/CachedProfilesData
    fi
    # Removes `logs` directory
    echo "    Removing logs directory..."
    if [ "$dry_run" = true ]; then
        echo "      rm -rf $data_dir/logs/*"
    else
        rm -rf $data_dir/logs/*
    fi
    # TODO: Clean `User/workspaceStorage`
}

# Function to clean `.vscode-server/extensions` directory
clean_extensions() {
    local extensions_dir="$1"
    echo "  Cleaning extensions directory..."
    # `.obsolete` is a JSON file like: {"<extension>": true, ...}
    # We can safely remove the directories listed in this file
    echo "    Removing obsolete extensions..."
    if [ -f "$extensions_dir/.obsolete" ]; then
        # Use REGEX to extract the extension names
        obsolete_extensions=$(grep -oE '"[^:][^"]+"' "$extensions_dir/.obsolete" | tr -d '"')
        if [ "$dry_run" = true ]; then
            for ext in $obsolete_extensions; do
                echo "      rm -rf $extensions_dir/$ext"
            done
            echo "      echo '{}' > $extensions_dir/.obsolete" # Empty the `.obsolete` file
        else
            for ext in $obsolete_extensions; do
                rm -rf $extensions_dir/$ext
            done
            echo '{}' > "$extensions_dir/.obsolete" # Empty the `.obsolete` file
        fi
    fi
}

# Function to clean `.vscode-server/cli/servers` directory
clean_servers() {
    local servers_dir="$1"
    echo "  Cleaning servers directory..."
    # Removes `Stable-\w+{40}` directories, KEEPING THE LATEST (by modification time)
    echo "    Removing old versions of vscode-server directories..."
    if [ "$dry_run" = true ]; then
        find "$servers_dir" -maxdepth 1 -type d -regextype egrep -regex "$servers_dir/Stable-\w{40}" -exec stat --format="%Y %n" {} \; | sort -n | awk '{print $2}' | head -n -1 | xargs echo "      rm -rf"
    else
        find "$servers_dir" -maxdepth 1 -type d -regextype egrep -regex "$servers_dir/Stable-\w{40}" -exec stat --format="%Y %n" {} \; | sort -n | awk '{print $2}' | head -n -1 | xargs rm -rf
    fi
}

# Function to clean a given `.vscode-server` directory
clean_one() {
    local vscode_dir="$1"
    # Display the directory size
    echo "  *Directory size before clean: $(du -sh $vscode_dir | cut -f1)"

    # Removes `\.\w+{40}\.pid` and `\.\w+{40}\.token` files
    echo "  Removing pid & token files..."
    if [ "$dry_run" = true ]; then
        find "$vscode_dir" -maxdepth 1 -type f -regextype egrep -regex '.+/\.\w{40}\.(pid|token)' -exec echo "    rm {}" \;
    else
        find "$vscode_dir" -maxdepth 1 -type f -regextype egrep -regex '.+/\.\w{40}\.(pid|token)' -exec rm {} \;
    fi
    # Removes `.+\.log` files
    echo "  Removing log files..."
    if [ "$dry_run" = true ]; then
        find "$vscode_dir" -maxdepth 1 -type f -regextype egrep -regex '.+/.+\.log' -exec echo "    rm {}" \;
    else
        find "$vscode_dir" -maxdepth 1 -type f -regextype egrep -regex '.+/.+\.log' -exec rm {} \;
    fi
    # Removes `code-\w+{40}` files, KEEPING THE LATEST (by modification time)
    echo "  Removing old versions of vscode-server binary..."
    if [ "$dry_run" = true ]; then
        find "$vscode_dir" -maxdepth 1 -type f -regextype egrep -regex '.+/code-\w{40}' -exec stat --format="%Y %n" {} \; | sort -n | awk '{print $2}' | head -n -1 | xargs echo "    rm"
    else
        find "$vscode_dir" -maxdepth 1 -type f -regextype egrep -regex '.+/code-\w{40}' -exec stat --format="%Y %n" {} \; | sort -n | awk '{print $2}' | head -n -1 | xargs rm
    fi
    # Clean `data` directory
    clean_data "$vscode_dir/data"
    # Clean `extensions` directory
    clean_extensions "$vscode_dir/extensions"
    # Clean `cli/servers` directory
    clean_servers "$vscode_dir/cli/servers"

    # Display the directory size after clean if not dry run
    if [ "$dry_run" = false ]; then
        echo "  *Directory size after clean: $(du -sh $vscode_dir | cut -f1)"
    fi
}

if [ "$all_users" = true ]; then
    # Find all `.vscode-server` directories under the home directory
    vscode_dirs=$(find /home -maxdepth 2 -type d -name .vscode-server)
    # Check for `/root/.vscode-server` directory
    if [ -d "/root/.vscode-server" ]; then
        vscode_dirs="$vscode_dirs /root/.vscode-server"
    fi

    # Clean all `.vscode-server` directories
    for vscode_dir in $vscode_dirs; do
        echo "Processing $vscode_dir..."
        clean_one "$vscode_dir"
    done
else
    vscode_dir="$HOME/.vscode-server"
    echo "Processing $vscode_dir..."
    clean_one "$vscode_dir"
fi
