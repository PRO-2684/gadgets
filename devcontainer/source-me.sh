# Attach to devcontainer (bash)
devatt() {
    cid=$(docker ps --filter "label=devcontainer.local_folder=$(pwd)" -q | head -n1)
    [ -n "$cid" ] && docker exec -e TERM=xterm-256color -it "$cid" bash || echo "No devcontainer found at $(pwd)"
}
# List running devcontainers
devls() {
    docker ps --filter "label=devcontainer.local_folder"
}
