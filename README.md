# node-require-me
Require module with mocks and clean cache

[![NPM version](https://img.shields.io/npm/v/require-me.svg)](https://npmjs.org/package/require-me)
[![Build status](https://img.shields.io/travis/tamtakoe/node-require-me.svg)](https://travis-ci.org/tamtakoe/node-require-me)

**Note:** This module works in browsers and Node.js >= 4.0

## Installation

```sh
npm install require-me
```

## Usage

```js
const requireMe = require('require-me');

const otherDep1Mock = require('./mocks/other-module-dep1.mock');

const otherModule = requireMe('other-module', {
    mocks: {
         '../lib/other-module-dep1': otherDep1Mock,
         './../lib/other-dep2': './mocks/other-dep2.mock',
    },
    pristine: true
})
```

## API

**modulePath** (String) - Module name or path

**options** (Object)

* `mocks` (Object) - Map of mocks of module dependencies as `{'module_dependency_path': 'mock_path'}`.
                     `module_dependency_path` and `mock_path` resolves relatively current file.
                     You can use object or function instead of `mock_path`.
                     It use [mock-require](https://www.npmjs.com/package/mock-require) for mocking
* `pristine` (Boolean) - Clean npm cache before loading
* `deep` (Boolean) - Clean npm cache for submodules except external and system modules

**Return value** (Any): Module.exports

## Tests

```sh
npm install
npm test
```

## License

[MIT](LICENSE)