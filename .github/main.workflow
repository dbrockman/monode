workflow "Build and test" {
  on = "push"
  resolves = "publish-if-success-on-master"
}

action "yarn-install" {
  uses = "./scripts/actions/local-yarn-command"
  args = "install"
}

action "yarn-bootstrap" {
  needs = "yarn-install"
  uses = "./scripts/actions/local-yarn-command"
  args = "bootstrap"
}

action "yarn-lint" {
  needs = "yarn-bootstrap"
  uses = "./scripts/actions/local-yarn-command"
  args = "lint"
}

action "yarn-test" {
  needs = "yarn-bootstrap"
  uses = "./scripts/actions/local-yarn-command"
  args = "test"
}

action "only-on-master-branch-success" {
  needs = ["yarn-lint", "yarn-test"]
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "bump-version-if-success-on-master" {
  needs = "only-on-master-branch-success"
  uses = "./scripts/actions/local-yarn-command"
  args = "lerna version --conventional-commits --create-release github --yes"
  secrets = ["GH_TOKEN"]
}

action "publish-if-success-on-master" {
  needs = "bump-version-if-success-on-master"
  uses = "./scripts/actions/local-yarn-command"
  args = "bump-version-and-publish"
  secrets = ["GH_TOKEN", "NPM_AUTH_TOKEN"]
}
