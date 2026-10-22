#!/usr/bin/env bash
set -euo pipefail

env="${1:-dev}"
requests="${2:-500}"
concurrency="${3:-10}"
url="http://${env}.lab.localhost:8080/api/info"

echo "Sending $requests requests to $url, $concurrency in parallel"
seq "$requests" \
  | xargs -P "$concurrency" -I{} curl -s "$url" \
  | grep -o '"pod":"[^"]*"' \
  | sort | uniq -c
