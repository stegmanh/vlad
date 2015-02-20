var util = vlad.util;

describe('the src/util.js functions', function() {

    describe('util.defineGetters', function() {
        var obj = util.defineGetters({}, {

            testContext: function() {
                expect(this).to.equal(obj);
            },

            testReturnSelf: function() {
                var a = 1 + 1;
            },

            testReturnValue: function() {
                return 1 + 1;
            }

        });

        it('sets context of handler correctly', function() {
            obj.testContext;
        });

        it('returns the context when no value is returned from handler', function() {
            expect(obj.testReturnSelf).to.equal(obj);
        });

        it('returns a value when the handler returns one', function() {
            expect(obj.testReturnValue).to.equal(2);
        });
    });

    describe('util.defineSetters', function() {
        var obj = util.defineSetters({}, {

            testContext: function() {
                expect(this).to.equal(obj);
            },

            testReturnSelf: function() {
                var a = 1 + 1;
            },

            testReturnValue: function() {
                return 1 + 1;
            },

            testArguments: function() {
                return arguments.length;
            }
        });

        it('sets context of handler correctly', function() {
            obj.testContext();
        });

        it('returns the context when no value is returned from handler', function() {
            expect(obj.testReturnSelf()).to.equal(obj);
        });

        it('returns a value when the handler returns one', function() {
            expect(obj.testReturnValue()).to.equal(2);
        });

        it('gets any given arguments', function() {
            expect(obj.testArguments(1, 2)).to.equal(2);
        });
    });

    describe('util.keyMap', function() {
        var start = {a: 'alpha', b: 'beta'}

        it('maps keys correctly', function() {
            var goal = {'alpha': 'alpha', 'beta': 'beta'},
                end = util.keyMap(start, function(value, key) { return value; });

            expect(end).to.deep.equal(goal);
        });

        it('doesnt include out undefined keys', function() {
            var goal = {},
                end = util.keyMap(start, function() { return; });

            expect(end).to.deep.equal(goal);
        });
    });

    describe('util.resolveObject', function() {

        it('correctly resolves an object of mixed keys', function() {
            return util.resolveObject({
                a: "test",
                b: Promise.resolve('test'),
                c: {then: function(res, rej) { return res('test'); }}
            }).then(function(obj) {
                expect(obj.a).to.equal('test');
                expect(obj.b).to.equal('test');
                expect(obj.c).to.equal('test');
            }).catch(function(obj) {
                expect(obj).to.equal(undefined);
            });
        });

        it('shows only rejected errors', function() {
            return util.resolveObject({
                a: Promise.reject('test'),
                b: 'whoooo',
                c: {then: function(res, rej) { return rej('test'); }}
            }).catch(function(err) {
                expect(err.fields.a).to.equal('test');
                expect(err.fields.b).to.equal(undefined);
                expect(err.fields.c).to.equal('test');
            });
        });
    });

    describe('util.isObject', function() {
        var objects = [{}, Object.create({}), Object.create(null)];
        var notObjects = [1, 'test', null, undefined, [], Number(), String(), Math, function(){}];

        objects.forEach(function(value) {
            it('should accept', function() {
                expect(util.isObject(value)).to.equal(true);
            });
        });

        notObjects.forEach(function(value) {
            it('should reject ' + value, function() {
                expect(util.isObject(value)).to.equal(false);
            });
        });
    });
});
