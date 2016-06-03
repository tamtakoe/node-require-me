var fs             = require('fs');
var path           = require('path');
var callerPath     = require('caller');
var mockRequire    = require('mock-require');
var findModuleDeps = require('find-module-deps');

function isModuleNotFoundError(e){
    return e.code && e.code === 'MODULE_NOT_FOUND';
}

function getFullPath(modulePath, calledFrom) {
    var resolvedPath;
    try {
        resolvedPath = require.resolve(modulePath);
    } catch(e) { }

    var isExternal = /[/\\]node_modules[/\\]/.test(resolvedPath);
    var isSystemModule = resolvedPath === modulePath;
    if (isExternal || isSystemModule) {
        return resolvedPath;
    }

    var isLocalModule = /^\.{1,2}[/\\]/.test(modulePath);
    if (!isLocalModule) {
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
 * @param {Object} options
 * @param {Object}   mocks - map of mocks of module dependencies as {'module_dependency_path': 'mock_path'}.
 *                           You can use object or function instead of 'mock_path'
 * @param {Boolean}  pristine - clean npm cache before loading
 * @param {Boolean}  deep - clean npm cache for submodules
 *
 * @returns {*} module
 */
function requireMe(modulePath, options) {
    options = options || {};
    
    var mocks = options.mocks || {};
    var pristine = options.pristine;
    var deep = options.deep === undefined ? true : options.deep;

    var calledFrom = callerPath();
    var fullModulePath = getFullPath(modulePath, calledFrom);
    var mocksArr = Object.keys(mocks).map(function(path) {
            return {
                path: getFullPath(path, calledFrom),
                value: typeof mocks[path] === 'string' ? getFullPath(mocks[path], calledFrom) : mocks[path]
            };
    });

    if (pristine) {
        if (deep) {
            var moduleCode = fs.readFileSync(fullModulePath);
            var deps = findModuleDeps(moduleCode);

            var childrenPaths = deps.map(function(localPath) {
                return getFullPath(localPath, fullModulePath);
            });

            childrenPaths.forEach(function(childPath) {
                requireMe(childPath, {pristine: true})
            });


        }

        delete require.cache[require.resolve(fullModulePath)];
    }

    mocksArr.forEach(function(mock) {
        mockRequire(mock.path, mock.value);
    });

    return require(fullModulePath);
}

module.exports = requireMe;