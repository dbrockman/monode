#!/usr/bin/env bash

set -e
echo

if [ -n "$GIT_USER_EMAIL" ]; then
  git config --global user.email "$GIT_USER_EMAIL"
fi

if [ -n "$GIT_USER_NAME" ]; then
  git config --global user.name "$GIT_USER_NAME"
fi

# Lerna expects an env var named GH_TOKEN
if [[ -z "$GH_TOKEN" ]] && [[ -n "$GITHUB_TOKEN" ]]; then
  export GH_TOKEN="$GITHUB_TOKEN"
fi

if [[ -n "$GH_USERNAME" ]] && [[ -n "$GITHUB_TOKEN" ]]; then
  git remote set-url origin https://"${GH_USERNAME}":"${GITHUB_TOKEN}"@github.com/"${GITHUB_REPOSITORY}".git
fi

if [ -n "$NPM_AUTH_TOKEN" ]; then
  # Respect NPM_CONFIG_USERCONFIG if it is provided, default to $HOME/.npmrc
  NPM_CONFIG_USERCONFIG="${NPM_CONFIG_USERCONFIG-"$HOME/.npmrc"}"
  NPM_REGISTRY_URL="${NPM_REGISTRY_URL-registry.npmjs.org}"
  NPM_STRICT_SSL="${NPM_STRICT_SSL-true}"
  NPM_REGISTRY_SCHEME="https"
  if ! $NPM_STRICT_SSL
  then
    NPM_REGISTRY_SCHEME="http"
  fi

  # Allow registry.npmjs.org to be overridden with an environment variable
  printf "//%s/:_authToken=%s\\nregistry=%s\\nstrict-ssl=%s\\n" "$NPM_REGISTRY_URL" "$NPM_AUTH_TOKEN" "${NPM_REGISTRY_SCHEME}://$NPM_REGISTRY_URL" "${NPM_STRICT_SSL}" > "$NPM_CONFIG_USERCONFIG"

  chmod 0600 "$NPM_CONFIG_USERCONFIG"
fi

exec node ./.yarn/releases/yarn-1.17.3.js "$@"
