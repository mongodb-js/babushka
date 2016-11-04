#!/usr/bin/env node

/* eslint no-sync: 0, no-console: 0 */
const walk = require('fs-walk');
const fs = require('fs');
const path = require('path');
const less = require('less');
const semver = require('semver');
const _ = require('lodash');
const argv = require('yargs')
  .usage('Usage: $0 [-i <source.less>] [-o <destination.css>]')
  .help()
  .option('input', {
    alias: 'i',
    describe: 'source .less file',
    default: './src/styles/index.less'
  })
  .option('output', {
    alias: 'o',
    describe: 'destination .css file',
    default: './lib/styles/index.css'
  }).argv;

const ROOT_PATH = process.cwd();
const PACKAGE_PATH = path.join(ROOT_PATH, 'package.json');
const NODE_MODULES_PATH = path.join(ROOT_PATH, 'node_modules');
const OUTPUT_CSS_PATH = path.join(ROOT_PATH, path.parse(argv.output).dir);

let pkg;
try {
  pkg = require(PACKAGE_PATH);
} catch (e) {
  return console.error(e.message);
}
const dependencies = _.keys(pkg.dependencies);
const stylePaths = {};

walk.dirsSync(NODE_MODULES_PATH, (basedir, filename, stat) => {
  if (stat.isDirectory() && _.includes(dependencies, filename)) {
    // check if its package.json has a direct dependency on babushka
    const innerPath = path.join(basedir, filename);
    let innerPkg;
    try {
      innerPkg = require(path.join(innerPath, 'package.json'));
    } catch (e) {
      // skip directories that don't have a package.json file.
      return;
    }
    const innerVersion = innerPkg.version;
    if (_.includes(_.keys(innerPkg.dependencies), 'babushka') ||
        _.get(innerPkg, 'babushka')) {
      try {
        const cssPath = path.join(innerPath, argv.output);
        fs.accessSync(cssPath);
        if (_.has(stylePaths, filename)) {
          // component was already parsed before
          if (stylePaths[filename].version === innerVersion) {
            // same version, can safely be ignored
            return;
          }
          console.warn(`multiple dependencies on module ${filename} with different versions detected. Keeping latest version.`);
          if (semver.lt(innerVersion, stylePaths[filename].version)) {
            return;
          }
        }
        stylePaths[filename] = {
          version: innerVersion,
          path: cssPath
        };
      } catch (e) {
        // skip errors
      }
    }
  }
});

// now process the style files and write them to ./lib/styles/index.css
const SRC_STYLE_ROOT = path.join(ROOT_PATH, path.parse(argv.input).dir);

let lessFile;
try {
  lessFile = fs.readFileSync(path.join(SRC_STYLE_ROOT, 'index.less'), {encoding: 'utf8'});
} catch (e) {
  return console.error(path.basename(__filename), `requires ${argv.input} to be present.`);
}

_.each(stylePaths, (css, component) => {
  lessFile += `@import (less) '${css.path}';\n`;
  console.log(`  ✓ include styles for component ${component}.`);
});

less.render(lessFile, {paths: SRC_STYLE_ROOT}, (errLess, output) => {
  if (errLess) {
    return console.error(errLess);
  }
  fs.mkdir(OUTPUT_CSS_PATH, (errMkdir) => {
    if (errMkdir) {
      if (errMkdir.code !== 'EEXIST') {
        return console.error(errMkdir);
      }
    }
    const OUTPUT_CSS = path.join(OUTPUT_CSS_PATH, path.basename(argv.output));
    fs.writeFile(OUTPUT_CSS, output.css, (errWrite) => {
      if (errWrite) {
        return console.error(errWrite);
      }
      const RELATIVE_OUTPUT_CSS = path.relative(ROOT_PATH, OUTPUT_CSS);
      console.log(`  ✓ successfully written ./${RELATIVE_OUTPUT_CSS}`);
    });
  });
});
