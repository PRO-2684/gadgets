# Attach to devcontainer (bash)
devatt() {
    local cid
    cid=$(docker ps --filter "label=devcontainer.local_folder=$(pwd)" -q | head -n1)

    if [ -z "$cid" ]; then
        echo "No devcontainer found at $(pwd)." >&2
        return 1
    fi

    echo "Attaching to devcontainer with ID $cid at $(pwd)..." >&2
    docker exec -e TERM="${TERM:-xterm-256color}" -it "$cid" bash -i
}
# List running devcontainers
devls() {
    docker ps --filter "label=devcontainer.local_folder"
    # --format "table {{.ID}}\t{{.Image}}\t{{.Labels}}"
}
