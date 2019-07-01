const fs = require("fs");
const { join } = require("path");
const { URL } = require("url");
const inquirer = require("inquirer");
const prettier = require("prettier");
const prettier_config = require("../.prettierrc.js");
const { version } = require("../lerna.json");
const { license, repository, homepage } = require("../package.json");

const packages_dir_name = "code";

// Run
main();

function main() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "scope",
        message: `Package scope:`,
        default: "@dbrockman",
        validate: validatePackageScope,
      },
      {
        type: "input",
        name: "name",
        message: (answers) => `Package name (without the "${answers.scope}/" part):`,
        validate: validatePackageName,
      },
      {
        type: "input",
        name: "description",
        message: `Short description:`,
      },
      {
        type: "list",
        name: "access",
        message: "Private or public access on npm",
        choices: ["restricted", "public"],
      },
      {
        type: "list",
        name: "publishable",
        message: "Mark package as private to prevent publication to npm?",
        choices: [{ name: "allow publication", value: true }, { name: "prevent publication", value: false }],
      },
    ])
    .then(writePackageStub);
}

function validatePackageScope(scope) {
  // pattern of "^(?:@[a-z0-9-~][a-z0-9-._~]*/)?[a-z0-9-~][a-z0-9-._~]*$".
  const re = /^@[a-z0-9-][a-z0-9-._]*$/;
  if (re.test(scope)) {
    return true;
  }
  return `The package scope must match the regexp ${re}`;
}

function validatePackageName(name) {
  const re = /^[a-z0-9-][a-z0-9-._]*$/;
  if (!re.test(name)) {
    return `The package name must match the regexp ${re}`;
  }
  if (fs.existsSync(pathTo(name))) {
    return `A package with name "${name}" already exists.`;
  }
  return true;
}

function writePackageStub(answers) {
  const { scope, name } = answers;

  fs.mkdirSync(pathTo(name));
  fs.mkdirSync(pathTo(name, "src"));
  fs.mkdirSync(pathTo(name, "src/__tests__"));

  writeFile(
    name,
    "src/main.ts",
    "typescript",
    `
    export function main() {
      throw new Error('${name} is not implemented.')
    }
    `,
  );

  writeFile(
    name,
    "src/__tests__/main.test.ts",
    "typescript",
    `
    import { main } from '../main';

    test('${scope}/${name}', () => {
      expect(() => main()).not.toThrow();
    });
    `,
  );

  writeFile(name, "package.json", "json", {
    name: `${scope}/${name}`,
    version: version,
    description: answers.description,
    private: answers.publishable ? undefined : true,
    main: "build/main.js",
    types: "build/main.d.ts",
    files: ["build"],
    scripts: {
      clean: "del 'build'",
      build: "tsc -p tsconfig.build.json",
      prebuild: "yarn run clean",
      postbuild: "del 'build/**/__*__/'",
    },
    dependencies: {},
    devDependencies: {},
    publishConfig: { access: answers.access },
    license: license,
    repository: repository,
    homepage: formatHomepageUrlForPackage(name),
  });

  writeFile(
    name,
    "README.md",
    "markdown",
    trimIndentation(`
      # \`${scope}/${name}\`

      ${answers.description}

      \`\`\`sh
      yarn add ${scope}/${name}
      \`\`\`
   `),
  );

  writeFile(name, "tsconfig.build.json", "json", {
    extends: "../../tsconfig.build.json",
    include: ["src/**/*"],
    compilerOptions: {
      outDir: "./build",
    },
  });

  writeFile(name, "tsconfig.json", "json", {
    extends: "../../tsconfig.json",
    include: ["src/**/*"],
  });

  fs.writeFileSync(pathTo(name, "LICENSE"), fs.readFileSync(join(__dirname, "..", "LICENSE")));
}

function formatHomepageUrlForPackage(name) {
  const url = new URL(homepage);
  url.pathname += `/tree/master/${packages_dir_name}/${name}`;
  return url.toString();
}

function writeFile(name, rel_path, parser, content) {
  const file_path = pathTo(name, rel_path);
  const str = parser === "json" ? JSON.stringify(content, null, 2) : content;
  const formatted = prettier.format(str, { ...prettier_config, parser });
  fs.writeFileSync(file_path, formatted, { encoding: "utf8" });
}

function trimIndentation(str) {
  return str
    .split("\n")
    .map((s) => s.trimLeft())
    .join("\n");
}

function pathTo(...parts) {
  return join(__dirname, "..", packages_dir_name, ...parts);
}
