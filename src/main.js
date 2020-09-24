import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import {promisify} from 'util';
import execa from 'execa';
import Listr from 'listr';
import {projectInstall} from 'pkg-install';

const access = promisify(fs.access);
const copy = promisify(ncp);


async function copyTemplateFiles(opts) {
 return copy(opts.templateDirectory, opts.targetDirectory, {
   clobber: false,
 });
}


async function createProject() {

  const opts = {
    targetDirectory: process.cwd(),
    template: 'typescript',
  };

  const currentFileUrl = import.meta.url;
  const templateDir = path.resolve(new URL(currentFileUrl).pathname, '../../templates', opts.template);
  opts.templateDirectory = templateDir;

  try {
   await access(templateDir, fs.constants.R_OK);
  } catch (err) {
   console.error('%s Invalid template name', chalk.red.bold('ERROR'));
   process.exit(1);
  }

  const tasks = new Listr([
    {
      title: 'Copy project files',
      task: () => copyTemplateFiles(opts),
    },
    {
      title: 'Install dependencies',
      task: () => projectInstall({cwd: opts.targetDirectory}),
    },
  ]);

  await tasks.run();
  console.log('%s Project ready', chalk.green.bold('done'));
  return true;
}

export async function main() {
  await createProject();
}
