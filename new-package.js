const fs = require('fs');
const { join } = require('path');
const inquirer = require('inquirer');
const prettier = require('prettier');
const prettier_config = require('./.prettierrc.js');
const { version } = require('./lerna.json');

const scope = '@dbrockman';

// Run
main();

function main() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: `Package name (without the "${scope}/" part):`,
        validate: validatePackageName,
      },
      {
        type: 'input',
        name: 'description',
        message: `Short description:`,
      },
      {
        type: 'list',
        name: 'access',
        message: 'Private or public access on npm',
        choices: ['restricted', 'public'],
        default: 'public',
      },
      {
        type: 'confirm',
        name: 'publishable',
        message: 'Mark package as private to prevent publication to npm?',
        default: false,
      },
    ])
    .then(writePackageStub);
}

function validatePackageName(name) {
  const re = /^[a-z0-9-][a-z0-9-._]*$/;
  if (!re.test(name)) {
    return `The package name must match the regexp ${re}`;
  }
  if (fs.existsSync(join(__dirname, 'code', name))) {
    return `A package with name "${name}" already exists.`;
  }
  return true;
}

function writePackageStub(answers) {
  const { name } = answers;

  fs.mkdirSync(join(__dirname, 'code', name));
  fs.mkdirSync(join(__dirname, 'code', name, 'src'));
  fs.mkdirSync(join(__dirname, 'code', name, 'src/__tests__'));

  writeFile(
    name,
    'src/main.ts',
    'typescript',
    `
    export function main() {
      throw new Error('${name} is not implemented.')
    }
    `,
  );

  writeFile(
    name,
    'src/__tests__/main.test.ts',
    'typescript',
    `
    import { main } from '../main';

    test('${scope}/${name}', () => {
      expect(() => main()).not.toThrow();
    });
    `,
  );

  writeFile(name, 'package.json', 'json', {
    name: `${scope}/${name}`,
    version: version,
    description: answers.description,
    private: answers.publishable ? true : undefined,
    main: 'build/main.js',
    types: 'build/main.d.ts',
    files: ['build'],
    scripts: {
      clean: "del 'build'",
      build: 'tsc -p tsconfig.build.json',
      prebuild: 'yarn run clean',
      postbuild: "del 'build/**/__*__/'",
    },
    dependencies: {},
    devDependencies: {},
    publishConfig: { access: answers.access },
    repository: 'git@github.com:dbrockman/monode.git',
    homepage: `https://github.com/dbrockman/monode/tree/master/code/${name}#readme`,
  });

  writeFile(
    name,
    'README.md',
    'markdown',
    trimIndentation(`
      # \`${scope}/${name}\`

      ${answers.description}

      \`\`\`sh
      yarn add ${scope}/${name}
      \`\`\`
   `),
  );

  writeFile(name, 'tsconfig.build.json', 'json', {
    extends: '../../tsconfig.build.json',
    include: ['src/**/*'],
    compilerOptions: {
      outDir: './build',
    },
  });

  writeFile(name, 'tsconfig.json', 'json', {
    extends: '../../tsconfig.json',
    include: ['src/**/*'],
  });
}

function writeFile(name, rel_path, parser, content) {
  const file_path = join(__dirname, 'code', name, rel_path);
  const str = parser === 'json' ? JSON.stringify(content, null, 2) : content;
  const formatted = prettier.format(str, { ...prettier_config, parser });
  fs.writeFileSync(file_path, formatted, { encoding: 'utf8' });
}

function trimIndentation(str) {
  return str
    .split('\n')
    .map((s) => s.trimLeft())
    .join('\n');
}
