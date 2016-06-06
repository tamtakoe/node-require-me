var fs             = require('fs');
var path           = require('path');
var callerPath     = require('caller');
var mockRequire    = require('mock-require');
var findModuleDeps = require('find-module-deps');

function isModuleNotFoundError(e){
    return e.code && e.code === 'MODULE_NOT_FOUND';
}

function isExternalModule(path) {
    return /[\/\\]node_modules[\/\\]/.test(path);
}

function isLocalModule(path) {
    return /^\.{1,2}[\/\\]/.test(path);
}

function isSystemModule(path) {
    return /^[^.\/\\]/.test(path);
}


function getFullPath(modulePath, calledFrom) {
    var resolvedPath;
    try {
        resolvedPath = require.resolve(modulePath);
    } catch(e) { }

    var isSystemModule = resolvedPath === modulePath;

    if (isExternalModule(resolvedPath) || isSystemModule) {
        return resolvedPath;
    }

    if (!isLocalModule(modulePath)) {
        return modulePath;
    }

    var localModuleName = path.join(path.dirname(calledFrom), modulePath);

    try {
        return require.resolve(localModuleName);
    } catch (e) {
        if (isModuleNotFoundError(e)) { return localModuleName; }
        else { throw e; }
    }
}

/**
 * @param {String} modulePath
 * @param {Object} [options]
 * @param {Object}   [mocks] - map of mocks of module dependencies as {'module_dependency_path': 'mock_path'}.
 *                           You can use object or function instead of 'mock_path'
 * @param {Boolean}  [pristine] - clean npm cache before loading
 * @param {Boolean}  [deep] - clean npm cache for submodules
 *
 * @returns {*} module
 */
function requireMe(modulePath, options) {
    options = options || {};

    var mocks = options.mocks || {};
    var pristine = options.pristine;
    var deep = options.deep;

    var calledFrom = callerPath();
    var fullModulePath = getFullPath(modulePath, calledFrom);
    var mocksArr = Object.keys(mocks).map(function(path) {
        return {
            path: getFullPath(path, calledFrom),
            value: typeof mocks[path] === 'string' ? getFullPath(mocks[path], calledFrom) : mocks[path]
        };
    });

    if (pristine) {
        if (deep && !(isExternalModule(fullModulePath) || isSystemModule(fullModulePath))) {
            var moduleCode = fs.readFileSync(fullModulePath);
            var deps = findModuleDeps(moduleCode) || [];

            deps.forEach(function(localPath) {
                var childPath = getFullPath(localPath, fullModulePath);

                requireMe(childPath, {pristine: true, deep: true})
            });
        }

        delete require.cache[require.resolve(fullModulePath)];
    }

    mocksArr.forEach(function(mock) {
        mockRequire(mock.path, mock.value);
    });

    const requiredModule = require(fullModulePath);

    mocksArr.forEach(function(mock) {
        mockRequire.stop(mock.path);
    });

    return requiredModule;
}

module.exports = requireMe;