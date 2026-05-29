# wait-sh

Wait for something before returning.

## `wait-gpu.sh`

Wait for GPU to be idle before returning. It uses `nvidia-smi` to check GPU status.

```bash
./wait-gpu.sh # Wait for all GPUs to be idle
./wait-gpu.sh 4 5 6 7 # Wait for GPU 4-7 to be idle
```

## `wait-pid.sh`

Wait for a process to finish before returning.

```bash
./wait-pid.sh 12345 # Wait for process with PID 12345 to finish
```
