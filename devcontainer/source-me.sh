# Attach to devcontainer (bash)
devatt() {
    local folder cid workspace user

    if [ "$#" -gt 1 ]; then
        echo "Usage: devatt [folder]" >&2
        return 2
    fi

    folder="${1:-$PWD}"

    if ! folder="$(cd "$folder" 2>/dev/null && pwd -P)"; then
        echo "Folder not found: $1" >&2
        return 1
    fi

    cid="$(
        docker ps \
            --filter "label=devcontainer.local_folder=$folder" \
            -q |
            head -n1
    )"

    if [ -z "$cid" ]; then
        echo "No devcontainer found at $folder." >&2
        return 1
    fi

    workspace="$(
        docker inspect -f '
{{- $folder := index .Config.Labels "devcontainer.local_folder" -}}
{{- range .Mounts -}}
{{- if eq .Source $folder -}}{{ .Destination }}{{- end -}}
{{- end -}}
' "$cid"
    )"
    workspace="${workspace:-/}"

    user="$(docker inspect -f '{{ .Config.User }}' "$cid")"
    user="${user:-root}"

    echo "Attaching to devcontainer $cid as $user at $workspace..." >&2

    docker exec \
        -e TERM="${TERM:-xterm-256color}" \
        -u "$user" \
        -w "$workspace" \
        -it "$cid" \
        bash -i
}
# List running devcontainers
devls() {
    docker ps --filter "label=devcontainer.local_folder"
    # --format "table {{.ID}}\t{{.Image}}\t{{.Labels}}"
}
