# Babushka [![travis][travis_img]][travis_url] [![npm][npm_img]][npm_url]

**Recursive style hoisting from nested babushka components.**

This package enables a nested component architecture, where component
dependencies are automatically detected and their styles included when
the main less file is processed.

## Quickstart

1. Add `babushka` as a dependency via `npm install --save babushka`.
2. Add `prepublish`, `pretest` and `prestart` hooks into your `package.json`
   which execute the babushka script:
   ```
   "scripts": {
     ...
     "prepublish": babushka",
     "pretest": babushka",
     "prestart": babushka"
     ...
   }
   ```
3. Make sure your main styles file is at `./src/styles/index.less` and imports
all other required styles via `@import` directives.

Now you can install additional packages that are also _babushka_ components
and their styles will automatically be included when babushka processes the
styles of this component. The resulting css file combines the styles of
this component and all other babushka style dependencies and is written to
`./lib/styles/index.css`.


## License

Apache 2.0

[travis_img]: https://img.shields.io/travis/mongodb-js/babushka.svg
[travis_url]: https://travis-ci.org/mongodb-js/babushka
[npm_img]: https://img.shields.io/npm/v/babushka.svg
[npm_url]: https://npmjs.org/package/babushka
