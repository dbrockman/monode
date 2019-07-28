# monode

Monorepo of random stuff

## Change Log

All notable changes to this project will be documented in the [CHANGELOG.md](CHANGELOG.md) file. This file is generated based on commit messages, see [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## Adding new packages

There is a script to generate a stub for a new package. Run `yarn new-package`, it will ask for a name and then generate stub files for the new package.

## Offline yarn

Yarn itself is stored in the repo as a bundled release in the dir `.yarn/releases/`. This ensures that the same version of yarn is used by everyone so that builds are more consistent. The file `.yarnrc` points to the bundled release of yarn.

When using yarn in this repo, yarn will find the `.yarnrc` and delegate the command to the bundled file.

The `.yarnrc` file also specifies that an _offline mirror_ should be used. This will save the tar file of every dependecy in the dir `.yarn/offline-mirror`. When installing dependencies with `yarn install` it will install them from these tar files without using the network. This ensures a reliable, fast and consistent instalation. It will even trigger an error if any required dependencies are not available in local cache.

### Steps to update yarn:

1. Download the latest stable version from [https://github.com/yarnpkg/yarn/releases/latest](https://github.com/yarnpkg/yarn/releases/latest). It will be named `yarn-{VERSION}.js`.
2. Save it in `.yarn/releases/`
3. Edit `.yarnrc` to point to the new file.
4. Remove the old yarn file.
