workflow "Build and test" {
  on = "push"
  resolves = ["yarn-test"]
}

action "yarn-install" {
  uses = "./scripts/actions/local-yarn-command"
  args = "install"
}

action "yarn-bootstrap" {
  uses = "./scripts/actions/local-yarn-command"
  args = "bootstrap"
  needs = ["yarn-install"]
}

action "yarn-lint" {
  uses = "./scripts/actions/local-yarn-command"
  args = "lint"
  needs = ["yarn-bootstrap"]
}

action "yarn-test" {
  uses = "./scripts/actions/local-yarn-command"
  args = "test"
  needs = ["yarn-lint"]
}
