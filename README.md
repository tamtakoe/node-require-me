# node-require-me
Require module with mocks and clean cache

[![NPM version](https://img.shields.io/npm/v/require-me.svg)](https://npmjs.org/package/node-require-me)
[![Build status](https://img.shields.io/travis/tamtakoe/node-require-me.svg)](https://travis-ci.org/tamtakoe/node-require-me)

**Note:** This module works in browsers and Node.js >= 4.0

## Installation

```sh
npm install node-require-me
```

## Usage

```js
var requireMe = require('require-me');

var otherDep1Mock = require('./mocks/other-module-dep1.mock');

var otherModule = requireMe('other-module', {
    mocks: {
         '../lib/other-module-dep1': otherDep1Mock,
         './../lib/other-dep2': './mocks/other-dep2.mock',
    },
    pristine: true
})
```

### API

**Path** (String) - Module name or path

**Options** (Object)

* `mocks` (Object) - Map of mocks of module dependencies as {'module_dependency_path': 'mock_path'}.
                     You can use object or function instead of 'mock_path'.
                     It use [mock-require](https://www.npmjs.com/package/mock-require) for mocking
* `pristine` (Boolean) - Clean npm cache before loading
* `deep` (Boolean) - Clean npm npm cache for submodules

**Return value** (Any): Module.exports

## Tests

```sh
npm install
npm test
```

## License

[MIT](LICENSE)