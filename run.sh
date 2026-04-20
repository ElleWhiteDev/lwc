#!/bin/bash
set -e

trap 'kill 0' EXIT

npm run dev &
node server/index.js &

wait
