'use strict';

var requireMe = require('./../index');
var expect = require('chai').expect;

describe('require me', function() {

    beforeEach(function() {
        Object.keys(require.cache).forEach(function(key) {
            delete require.cache[key];
        });

        require('./counter')();
    });

    it('should require counter', function() {
        var counter = requireMe('./counter')();

        expect(counter).to.equal(2);
    });

    it('should require pristine counter', function() {
        var counter = requireMe('./counter', {pristine: true})();

        expect(counter).to.equal(1);
    });

    it('should require cached dependencies of counter wrapper', function() {
        var counter = requireMe('./counter-wrapper', {pristine: true})();

        expect(counter).to.equal(2);
    });

    it('should require pristine dependencies of counter wrapper', function() {
        var counter = requireMe('./counter-wrapper', {pristine: true, deep: true})();

        expect(counter).to.equal(1);
    });
});