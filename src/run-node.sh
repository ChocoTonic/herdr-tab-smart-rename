#!/bin/sh
set -eu

node_path=$(command -v node 2>/dev/null || true)
if [ -n "$node_path" ] && [ -x "$node_path" ]; then
  exec "$node_path" "$@"
fi

if [ -n "${HOME:-}" ] && [ -x "$HOME/.local/bin/node" ]; then
  exec "$HOME/.local/bin/node" "$@"
fi

for node_path in /opt/homebrew/bin/node /usr/local/bin/node /home/linuxbrew/.linuxbrew/bin/node; do
  if [ -x "$node_path" ]; then
    exec "$node_path" "$@"
  fi
done

printf '%s\n' 'Smart Rename: Node.js not found; install Node.js 24.22.1+ or add it to the Herdr server PATH' >&2
exit 127
