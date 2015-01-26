var _ = require('lodash'),
    util = require('./util'),
    error = require('./errors'),
    Promise = require('bluebird'),
    formats = require('tv4-formats'),
    validator = require('tv4').freshApi(),
    Property = require('./property').Property;

module.exports = vlad;

/**
 * vlad validator factory
 * Returns a function that can be used to validate objects
 * @param {Object} schema
 * @return {Function}
 */
function vlad(schema) {
    if (!schema) throw new Error("No schema.");

    if (schema instanceof Property) {
        schema = schema.toSchema();

        return function vladidateVal(val) {
            return resolve(schema, val);
        }
    } else {
        // Process the passed in schema into valid jsonschema.
        // Simply calling the property.js objects toSchema function if
        // it exists, otherwise assume that it is already valid schema
        // or a 'vladitate' function
        schema = _.reduce(schema, reduceSchema, {});

        return function vladidateObj(obj) {
            var o = Object.create(null);

            for (key in schema) {
                o[key] = resolve(schema[key], obj[key]);
            }

            return util.resolveObject(o);
        }
    }
}

//
// Types
//

util.defineGetters(vlad, {
    string: require('./types/string'),
    number: require('./types/number'),
    integer: require('./types/integer')
});

vlad.enum = function(enums) {
    var prop = new Property();
    prop._enum = enums;
    return prop;
}

//
// Formats
//

/**
 * Adds one or more formats
 * @param {String|Object}
 * @param {Function}
 * @return vlad
 */
vlad.addFormat = function() {
    validator.addFormat.apply(validator, arguments);
    return vlad;
}

vlad.addFormat(formats);


//
// Util
//

// Schema mapping function, so we don't create a new closure very time
function reduceSchema(memo, value, key) {
    memo[key] = typeof value.toSchema === 'function' ? value.toSchema() : value;
    return memo;
}

/**
 * Resolve a function or jsonschema to a promise
 * @param {Function|Object} rule
 * @param {*} value
 * @param {Promise}
 */
function resolve(rule, value) {

    // if vladidate function, call it
    if (typeof rule === 'function') return rule(value);

    // if no value and a default value was specified, use that and skip validation
    if (value === undefined && rule.default !== undefined) return Promise.resolve(rule.default);

    var result = validator.validateMultiple(value, rule);
    if (result.errors.length) {

        // if catch is on, fall back on default or undefined
        if (rule.catch)  {
            return Promise.resolve(rule.default);
        }

        return Promise.reject( new error.FieldValidationError(result.errors[0].message));
    }
    return Promise.resolve(value);
}
