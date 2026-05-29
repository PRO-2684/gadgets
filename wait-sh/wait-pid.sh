#!/usr/bin/env bash
set -euo pipefail

PID="$1"

while kill -0 "$PID" 2>/dev/null; do
    echo "Process $PID still running..."
    sleep 5
done

echo "Process $PID exited."
