#!/usr/bin/env bash
set -euo pipefail

THRESHOLD=1 # Maximum GPU memory usage considered idle (in percent)

# Default: all GPUs
if (( $# == 0 )); then
    mapfile -t GPUS < <(
        nvidia-smi --query-gpu=index --format=csv,noheader,nounits
    )
else
    GPUS=("$@")
fi

while true; do
    all_ok=true

    for gpu in "${GPUS[@]}"; do
        read -r used total <<< "$(
            nvidia-smi \
                --id="$gpu" \
                --query-gpu=memory.used,memory.total \
                --format=csv,noheader,nounits |
            tr ',' ' '
        )"

        usage=$(( used * 100 / total ))

        echo "GPU #$gpu: ${usage}% (${used} MiB / ${total} MiB)"

        if (( usage >= THRESHOLD )); then
            all_ok=false
        fi
    done

    if $all_ok; then
        echo "All requested GPUs are below ${THRESHOLD}% memory usage."
        break
    fi

    echo "Waiting..."
    sleep 10
done
