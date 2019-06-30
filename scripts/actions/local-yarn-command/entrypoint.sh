#!/usr/bin/env bash

set -e
echo

exec node ./.yarn/releases/yarn-1.16.0.js "$@"
