#!/bin/bash
# spawn-agent-wrapper.sh — Helper for agents to communicate with orchestrator

AGENT=$1
ACTION=$2
PORT=${SDLC_PORT:-4242}
HOST=${SDLC_HOST:-127.0.0.1}

if [ -z "$AGENT" ] || [ -z "$ACTION" ]; then
  echo "Usage: spawn-agent-wrapper.sh <agent-name> <start|complete|fail>"
  exit 1
fi

case "$ACTION" in
  start)
    curl -sX POST "http://${HOST}:${PORT}/api/agent/spawn/${AGENT}" >/dev/null
    ;;
  complete)
    curl -sX POST "http://${HOST}:${PORT}/api/agent/complete/${AGENT}" >/dev/null
    ;;
  fail)
    curl -sX POST "http://${HOST}:${PORT}/api/agent/block/${AGENT}" >/dev/null
    ;;
  *)
    echo "Unknown action: $ACTION"
    exit 1
    ;;
esac
