/*
 * 工具包，大部分代码来自angularjs
 */
var hasClassList    = 'classList' in document.documentElement,
    hasOwnProp      = Object.prototype.hasOwnProperty,
    slice           = [].slice,
    //push            = [].push,
    toString        = Object.prototype.toString,
    urlParsingNode  = document.createElement("a"),
    uid             = ['0', '0', '0']
 

if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}

var utils = module.exports = {
    /**
     *  add class for IE9
     *  uses classList if available
     */
    addClass: function (el, cls) {
        if (hasClassList) {
            el.classList.add(cls)
        } else {
            var cur = ' ' + el.className + ' '
            if (cur.indexOf(' ' + cls + ' ') < 0) {
                el.className = (cur + cls).trim()
            }
        }
    },

    /**
     *  remove class for IE9
     */
    removeClass: function (el, cls) {
        if (hasClassList) {
            el.classList.remove(cls)
        } else {
            var cur = ' ' + el.className + ' ',
                tar = ' ' + cls + ' '
            while (cur.indexOf(tar) >= 0) {
                cur = cur.replace(tar, ' ')
            }
            el.className = cur.trim()
        }
    },

    hasClass: function (el, cls) {
        var cur = ' ' + el.className + ' '
        return cur.indexOf(' ' + cls + ' ') >= 0
    },

    toggleClass: function (el, cls) {
        if (utils.hasClass(el, cls))
            utils.removeClass(el, cls)
        else
            utils.addClass(el, cls)
    }
}

////////////////////////////////////
//copy from angularjs

/**
 * @kind function
 *
 * @description Converts the specified string to lowercase.
 * @param {string} string String to be converted to lowercase.
 * @returns {string} Lowercased string.
 */
var lowercase = function(string){return isString(string) ? string.toLowerCase() : string;}


/**
 * @kind function
 *
 * @description Converts the specified string to uppercase.
 * @param {string} string String to be converted to uppercase.
 * @returns {string} Uppercased string.
 */
var uppercase = function(string){return isString(string) ? string.toUpperCase() : string;}


var manualLowercase = function(s) {
  /* jshint bitwise: false */
  return isString(s)
      ? s.replace(/[A-Z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) | 32);})
      : s
}
var manualUppercase = function(s) {
  /* jshint bitwise: false */
  return isString(s)
      ? s.replace(/[a-z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) & ~32);})
      : s
}

// String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
// locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
// with correct but slower alternatives.
if ('i' !== 'I'.toLowerCase()) {
    lowercase = manualLowercase
    uppercase = manualUppercase
}


/**
 * IE 11 changed the format of the UserAgent string.
 * See http://msdn.microsoft.com/en-us/library/ms537503.aspx
 */
var msie = int((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);
if (isNaN(msie)) {
    msie = int((/trident\/.*; rv:(\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);
}

/**
 * @private
 * @param {*} obj
 * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,
 *                   String ...)
 */
function isArrayLike(obj) {
    if (obj == null || isWindow(obj)) {
        return false;
    }

    var length = obj.length;

    if (obj.nodeType === 1 && length) {
        return true;
    }

    return isString(obj) || isArray(obj) || length === 0 ||
        typeof length === 'number' && length > 0 && (length - 1) in obj;
}

/**
 * @ngdoc function
 * @name utils.forEach
 * @kind function
 *
 * @description
 * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
 * object or an array. The `iterator` function is invoked with `iterator(value, key)`, where `value`
 * is the value of an object property or an array element and `key` is the object property key or
 * array element index. Specifying a `context` for the function is optional.
 *
 * It is worth noting that `.forEach` does not iterate over inherited properties because it filters
 * using the `hasOwnProperty` method.
 *
 ```js
 var values = {name: 'misko', gender: 'male'};
 var log = [];
 angular.forEach(values, function(value, key) {
 this.push(key + ': ' + value);
 }, log);
 expect(log).toEqual(['name: misko', 'gender: male']);
 ```
 *
 * @param {Object|Array} obj Object to iterate over.
 * @param {Function} iterator Iterator function.
 * @param {Object=} context Object to become context (`this`) for the iterator function.
 * @returns {Object|Array} Reference to `obj`.
 */
function forEach(obj, iterator, context) {
    var key;
    if (obj) {
        if (isFunction(obj)) {
            for (key in obj) {
                // Need to check if hasOwnProperty exists,
                // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
                if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                    iterator.call(context, obj[key], key);
                }
            }
        } else if (obj.forEach && obj.forEach !== forEach) {
            obj.forEach(iterator, context);
        } else if (isArrayLike(obj)) {
            for (key = 0; key < obj.length; key++)
                iterator.call(context, obj[key], key);
        } else {
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        }
    }
    return obj;
}

function sortedKeys(obj) {
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys.sort();
}

function forEachSorted(obj, iterator, context) {
    var keys = sortedKeys(obj);
    for ( var i = 0; i < keys.length; i++) {
        iterator.call(context, obj[keys[i]], keys[i]);
    }
    return keys;
}


/**
 * when using forEach the params are value, key, but it is often useful to have key, value.
 * @param {function(string, *)} iteratorFn
 * @returns {function(*, string)}
function reverseParams(iteratorFn) {
    return function(value, key) { iteratorFn(key, value); };
}
 */

/**
 * A consistent way of creating unique IDs in angular. The ID is a sequence of alpha numeric
 * characters such as '012ABC'. The reason why we are not using simply a number counter is that
 * the number string gets longer over time, and it can also overflow, where as the nextId
 * will grow much slower, it is a string, and it will never overflow.
 *
 * @returns {string} an unique alpha-numeric string
 */
function nextUid() {
    var index = uid.length;
    var digit;

    while(index) {
        index--;
        digit = uid[index].charCodeAt(0);
        if (digit == 57 /*'9'*/) {
            uid[index] = 'A';
            return uid.join('');
        }
        if (digit == 90  /*'Z'*/) {
            uid[index] = '0';
        } else {
            uid[index] = String.fromCharCode(digit + 1);
            return uid.join('');
        }
    }
    uid.unshift('0');
    return uid.join('');
}


/**
 * Set or clear the hashkey for an object.
 * @param obj object
 * @param h the hashkey (!truthy to delete the hashkey)
 */
function setHashKey(obj, h) {
    if (h) {
        obj.$$hashKey = h;
    }
    else {
        delete obj.$$hashKey;
    }
}

/**
 * @ngdoc function
 * @name utils.extend
 * @kind function
 *
 * @description
 * Extends the destination object `dst` by copying all of the properties from the `src` object(s)
 * to `dst`. You can specify multiple `src` objects.
 *
 * @param {Object} dst Destination object.
 * @param {...Object} src Source object(s).
 * @returns {Object} Reference to `dst`.
 */
function extend(dst) {
    var h = dst.$$hashKey;
    forEach(arguments, function(obj) {
        if (obj !== dst) {
            forEach(obj, function(value, key) {
                dst[key] = value;
            });
        }
    });

    setHashKey(dst,h);
    return dst;
}

function int(str) {
    return parseInt(str, 10);
}


function inherit(parent, extra) {
    return extend(new (extend(function() {}, {prototype:parent}))(), extra);
}

/**
 * @ngdoc function
 * @name utils.noop
 * @kind function
 *
 * @description
 * A function that performs no operations. This function can be useful when writing code in the
 * functional style.
 ```js
 function foo(callback) {
 var result = calculateResult();
 (callback || angular.noop)(result);
 }
 ```
 */
function noop() {}
noop.$inject = [];


/**
 * @ngdoc function
 * @name utils.identity
 * @kind function
 *
 * @description
 * A function that returns its first argument. This function is useful when writing code in the
 * functional style.
 *
 ```js
 function transformer(transformationFn, value) {
 return (transformationFn || angular.identity)(value);
 };
 ```
 */
function identity($) {return $;}
identity.$inject = [];


//function valueFn(value) {return function() {return value;};}

/**
 * @ngdoc function
 * @name utils.isUndefined
 * @kind function
 *
 * @description
 * Determines if a reference is undefined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is undefined.
 */
function isUndefined(value){return typeof value === 'undefined';}


/**
 * @ngdoc function
 * @name utils.isDefined
 * @kind function
 *
 * @description
 * Determines if a reference is defined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is defined.
 */
function isDefined(value){return typeof value !== 'undefined';}


/**
 * @ngdoc function
 * @name utils.isObject
 * @kind function
 *
 * @description
 * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
 * considered to be objects. Note that JavaScript arrays are objects.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Object` but not `null`.
 */
function isObject(value){return value != null && typeof value === 'object';}


/**
 * @ngdoc function
 * @name utils.isString
 * @kind function
 *
 * @description
 * Determines if a reference is a `String`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `String`.
 */
function isString(value){return typeof value === 'string';}


/**
 * @ngdoc function
 * @name utils.isNumber
 * @kind function
 *
 * @description
 * Determines if a reference is a `Number`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Number`.
 */
function isNumber(value){return typeof value === 'number';}


/**
 * @ngdoc function
 * @name utils.isDate
 * @kind function
 *
 * @description
 * Determines if a value is a date.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Date`.
 */
function isDate(value) {
    return toString.call(value) === '[object Date]';
}


/**
 * @ngdoc function
 * @name utils.isArray
 * @kind function
 *
 * @description
 * Determines if a reference is an `Array`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Array`.
 */
var isArray = (function() {
    if (!isFunction(Array.isArray)) {
        return function(value) {
            return toString.call(value) === '[object Array]';
        };
    }
    return Array.isArray;
})();

/**
 * @ngdoc function
 * @name utils.isFunction
 * @kind function
 *
 * @description
 * Determines if a reference is a `Function`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Function`.
 */
function isFunction(value){return typeof value === 'function';}


/**
 * Determines if a value is a regular expression object.
 *
 * @private
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `RegExp`.
 */
function isRegExp(value) {
    return toString.call(value) === '[object RegExp]';
}


/**
 * Checks if `obj` is a window object.
 *
 * @private
 * @param {*} obj Object to check
 * @returns {boolean} True if `obj` is a window obj.
 */
function isWindow(obj) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
}


function isScope(obj) {
    return obj && obj.$evalAsync && obj.$watch;
}


function isFile(obj) {
    return toString.call(obj) === '[object File]';
}


function isBlob(obj) {
    return toString.call(obj) === '[object Blob]';
}


function isBoolean(value) {
    return typeof value === 'boolean';
}

/**
 * @ngdoc function
 * @name utils.isElement
 * @kind function
 *
 * @description
 * Determines if a reference is a DOM element (or wrapped jQuery element).
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a DOM element (or wrapped jQuery element).
 */
function isElement(node) {
    return !!(node &&
            (node.nodeName  // we are a direct element
             || (node.prop && node.attr && node.find)));  // we have an on and find method part of jQuery API
}

/**
 * @param str 'key1,key2,...'
 * @returns {object} in the form of {key1:true, key2:true, ...}
 */
function makeMap(str) {
    var obj = {}, items = str.split(","), i;
    for ( i = 0; i < items.length; i++ )
        obj[ items[i] ] = true;
    return obj;
}

/*
if (msie < 9) {
    nodeName_ = function(element) {
        element = element.nodeName ? element : element[0];
        return (element.scopeName && element.scopeName != 'HTML')
            ? uppercase(element.scopeName + ':' + element.nodeName) : element.nodeName;
    };
} else {
    nodeName_ = function(element) {
        return element.nodeName ? element.nodeName : element[0].nodeName;
    };
}

function map(obj, iterator, context) {
    var results = [];
    forEach(obj, function(value, index, list) {
        results.push(iterator.call(context, value, index, list));
    });
    return results;
}

*/

/**
 * @description
 * Determines the number of elements in an array, the number of properties an object has, or
 * the length of a string.
 *
 * Note: This function is used to augment the Object type in Angular expressions. See
 * {@link angular.Object} for more information about Angular arrays.
 *
 * @param {Object|Array|string} obj Object, array, or string to inspect.
 * @param {boolean} [ownPropsOnly=false] Count only "own" properties in an object
 * @returns {number} The size of `obj` or `0` if `obj` is neither an object nor an array.
 */
function size(obj, ownPropsOnly) {
    var count = 0, key;

    if (isArray(obj) || isString(obj)) {
        return obj.length;
    } else if (isObject(obj)) {
        for (key in obj)
            if (!ownPropsOnly || obj.hasOwnProperty(key))
                count++;
    }

    return count;
}

function contains(array, obj) {
    return indexOf(array, obj) != -1;
}

function indexOf(array, obj) {
    if (array.indexOf) return array.indexOf(obj);

    for (var i = 0; i < array.length; i++) {
        if (obj === array[i]) return i;
    }
    return -1;
}

function arrayRemove(array, value) {
    var index = indexOf(array, value);
    if (index >=0)
        array.splice(index, 1);
    return value;
}

/*
function isLeafNode (node) {
    if (node) {
        switch (node.nodeName) {
            case "OPTION":
            case "PRE":
            case "TITLE":
                return true;
        }
    }
    return false;
}
*/

/**
 * @ngdoc function
 * @name utils.copy
 * @kind function
 *
 * @description
 * Creates a deep copy of `source`, which should be an object or an array.
 *
 * * If no destination is supplied, a copy of the object or array is created.
 * * If a destination is provided, all of its elements (for array) or properties (for objects)
 *   are deleted and then all elements/properties from the source are copied to it.
 * * If `source` is not an object or array (inc. `null` and `undefined`), `source` is returned.
 * * If `source` is identical to 'destination' an exception will be thrown.
 *
 * @param {*} source The source that will be used to make a copy.
 *                   Can be any type, including primitives, `null`, and `undefined`.
 * @param {(Object|Array)=} destination Destination into which the source is copied. If
 *     provided, must be of the same type as `source`.
 * @returns {*} The copy or updated `destination`, if `destination` was specified.
 *
 * @example
 <example>
 <file name="index.html">
 <div ng-controller="Controller">
 <form novalidate class="simple-form">
 Name: <input type="text" ng-model="user.name" /><br />
 E-mail: <input type="email" ng-model="user.email" /><br />
 Gender: <input type="radio" ng-model="user.gender" value="male" />male
 <input type="radio" ng-model="user.gender" value="female" />female<br />
 <button ng-click="reset()">RESET</button>
 <button ng-click="update(user)">SAVE</button>
 </form>
 <pre>form = {{user | json}}</pre>
 <pre>master = {{master | json}}</pre>
 </div>

 <script>
 function Controller($scope) {
 $scope.master= {};

 $scope.update = function(user) {
// Example with 1 argument
$scope.master= angular.copy(user);
};

$scope.reset = function() {
// Example with 2 arguments
angular.copy($scope.master, $scope.user);
};

$scope.reset();
}
</script>
</file>
</example>
*/
function copy(source, destination, stackSource, stackDest) {
    if (isWindow(source) || isScope(source)) {
        throw "Can't copy! Making copies of Window or Scope instances is not supported.";
    }

    if (!destination) {
        destination = source;
        if (source) {
            if (isArray(source)) {
                destination = copy(source, [], stackSource, stackDest);
            } else if (isDate(source)) {
                destination = new Date(source.getTime());
            } else if (isRegExp(source)) {
                destination = new RegExp(source.source);
            } else if (isObject(source)) {
                destination = copy(source, {}, stackSource, stackDest);
            }
        }
    } else {
        if (source === destination) throw "Can't copy! Source and destination are identical.";

        stackSource = stackSource || [];
        stackDest = stackDest || [];

        if (isObject(source)) {
            var index = indexOf(stackSource, source);
            if (index !== -1) return stackDest[index];

            stackSource.push(source);
            stackDest.push(destination);
        }

        var result;
        if (isArray(source)) {
            destination.length = 0;
            for ( var i = 0; i < source.length; i++) {
                result = copy(source[i], null, stackSource, stackDest);
                if (isObject(source[i])) {
                    stackSource.push(source[i]);
                    stackDest.push(result);
                }
                destination.push(result);
            }
        } else {
            var h = destination.$$hashKey;
            forEach(destination, function(value, key) {
                delete destination[key];
            });
            for ( var key in source) {
                result = copy(source[key], null, stackSource, stackDest);
                if (isObject(source[key])) {
                    stackSource.push(source[key]);
                    stackDest.push(result);
                }
                destination[key] = result;
            }
            setHashKey(destination,h);
        }

    }
    return destination;
}

/**
 * Creates a shallow copy of an object, an array or a primitive
 */
function shallowCopy(src, dst) {
    if (isArray(src)) {
        dst = dst || [];

        for ( var i = 0; i < src.length; i++) {
            dst[i] = src[i];
        }
    } else if (isObject(src)) {
        dst = dst || {};

        for (var key in src) {
            if (hasOwnProp.call(src, key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
                dst[key] = src[key];
            }
        }
    }

    return dst || src;
}


/**
 * @ngdoc function
 * @name utils.equals
 * @kind function
 *
 * @description
 * Determines if two objects or two values are equivalent. Supports value types, regular
 * expressions, arrays and objects.
 *
 * Two objects or values are considered equivalent if at least one of the following is true:
 *
 * * Both objects or values pass `===` comparison.
 * * Both objects or values are of the same type and all of their properties are equal by
 *   comparing them with `angular.equals`.
 * * Both values are NaN. (In JavaScript, NaN == NaN => false. But we consider two NaN as equal)
 * * Both values represent the same regular expression (In JavaScript,
 *   /abc/ == /abc/ => false. But we consider two regular expressions as equal when their textual
 *   representation matches).
 *
 * During a property comparison, properties of `function` type and properties with names
 * that begin with `$` are ignored.
 *
 * Scope and DOMWindow objects are being compared only by identify (`===`).
 *
 * @param {*} o1 Object or value to compare.
 * @param {*} o2 Object or value to compare.
 * @returns {boolean} True if arguments are equal.
 */
function equals(o1, o2) {
    if (o1 === o2) return true;
    if (o1 === null || o2 === null) return false;
    if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
    var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
    if (t1 == t2) {
        if (t1 == 'object') {
            if (isArray(o1)) {
                if (!isArray(o2)) return false;
                if ((length = o1.length) == o2.length) {
                    for(key=0; key<length; key++) {
                        if (!equals(o1[key], o2[key])) return false;
                    }
                    return true;
                }
            } else if (isDate(o1)) {
                return isDate(o2) && o1.getTime() == o2.getTime();
            } else if (isRegExp(o1) && isRegExp(o2)) {
                return o1.toString() == o2.toString();
            } else {
                if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || isArray(o2)) return false;
                keySet = {};
                for(key in o1) {
                    if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
                    if (!equals(o1[key], o2[key])) return false;
                    keySet[key] = true;
                }
                for(key in o2) {
                    if (!keySet.hasOwnProperty(key) &&
                            key.charAt(0) !== '$' &&
                            o2[key] !== undefined &&
                            !isFunction(o2[key])) return false;
                }
                return true;
            }
        }
    }
    return false;
}


function sliceArgs(args, startIndex) {
    return slice.call(args, startIndex || 0);
}


/* jshint -W101 */
/**
 * @ngdoc function
 * @name utils.bind
 * @kind function
 *
 * @description
 * Returns a function which calls function `fn` bound to `self` (`self` becomes the `this` for
 * `fn`). You can supply optional `args` that are prebound to the function. This feature is also
 * known as [partial application](http://en.wikipedia.org/wiki/Partial_application), as
 * distinguished from [function currying](http://en.wikipedia.org/wiki/Currying#Contrast_with_partial_function_application).
 *
 * @param {Object} self Context which `fn` should be evaluated in.
 * @param {function()} fn Function to be bound.
 * @param {...*} args Optional arguments to be prebound to the `fn` function call.
 * @returns {function()} Function that wraps the `fn` with all the specified bindings.
 */
/* jshint +W101 */
function bind(self, fn) {
    var curryArgs = arguments.length > 2 ? sliceArgs(arguments, 2) : [];
    if (isFunction(fn) && !(fn instanceof RegExp)) {
        return curryArgs.length
            ? function() {
                return arguments.length
                    ? fn.apply(self, curryArgs.concat(slice.call(arguments, 0)))
                    : fn.apply(self, curryArgs);
            }
        : function() {
            return arguments.length
                ? fn.apply(self, arguments)
                : fn.call(self);
        };
    } else {
        // in IE, native methods are not functions so they cannot be bound (note: they don't need to be)
        return fn;
    }
}


function toJsonReplacer(key, value) {
    var val = value;

    if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
        val = undefined;
    } else if (isWindow(value)) {
        val = '$WINDOW';
    } else if (value &&  document === value) {
        val = '$DOCUMENT';
    } else if (isScope(value)) {
        val = '$SCOPE';
    }

    return val;
}


/**
 * @ngdoc function
 * @name utils.toJson
 * @kind function
 *
 * @description
 * Serializes input into a JSON-formatted string. Properties with leading $$ characters will be
 * stripped since angular uses this notation internally.
 *
 * @param {Object|Array|Date|string|number} obj Input to be serialized into JSON.
 * @param {boolean=} pretty If set to true, the JSON output will contain newlines and whitespace.
 * @returns {string|undefined} JSON-ified string representing `obj`.
 */
function toJson(obj, pretty) {
    if (typeof obj === 'undefined') return undefined;
    return JSON.stringify(obj, toJsonReplacer, pretty ? '  ' : null);
}


/**
 * @ngdoc function
 * @name utils.fromJson
 * @kind function
 *
 * @description
 * Deserializes a JSON string.
 *
 * @param {string} json JSON string to deserialize.
 * @returns {Object|Array|string|number} Deserialized thingy.
 */
function fromJson(json) {
    return isString(json)
        ? JSON.parse(json)
        : json;
}


function toBoolean(value) {
    if (typeof value === 'function') {
        value = true;
    } else if (value && value.length !== 0) {
        var v = lowercase("" + value);
        value = !(v == 'f' || v == '0' || v == 'false' || v == 'no' || v == 'n' || v == '[]');
    } else {
        value = false;
    }
    return value;
}


/////////////////////////////////////////////////

/**
 * Tries to decode the URI component without throwing an exception.
 *
 * @private
 * @param str value potential URI component to check.
 * @returns {boolean} True if `value` can be decoded
 * with the decodeURIComponent function.
 */
function tryDecodeURIComponent(value) {
    try {
        return decodeURIComponent(value);
    } catch(e) {
        // Ignore any invalid uri component
    }
}


/**
 * Parses an escaped url query string into key-value pairs.
 * @returns {Object.<string,boolean|Array>}
 */
function parseKeyValue(/**string*/keyValue) {
    var obj = {}, key_value, key;
    forEach((keyValue || "").split('&'), function(keyValue) {
        if ( keyValue ) {
            key_value = keyValue.split('=');
            key = tryDecodeURIComponent(key_value[0]);
            if ( isDefined(key) ) {
                var val = isDefined(key_value[1]) ? tryDecodeURIComponent(key_value[1]) : true;
                if (!obj[key]) {
                    obj[key] = val;
                } else if(isArray(obj[key])) {
                    obj[key].push(val);
                } else {
                    obj[key] = [obj[key],val];
                }
            }
        }
    });
    return obj;
}

function toKeyValue(obj) {
    var parts = [];
    forEach(obj, function(value, key) {
        if (isArray(value)) {
            forEach(value, function(arrayValue) {
                parts.push(encodeUriQuery(key, true) +
                    (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
            });
        } else {
            parts.push(encodeUriQuery(key, true) +
                (value === true ? '' : '=' + encodeUriQuery(value, true)));
        }
    });
    return parts.length ? parts.join('&') : '';
}


/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriSegment(val) {
    return encodeUriQuery(val, true).
        replace(/%26/gi, '&').
        replace(/%3D/gi, '=').
        replace(/%2B/gi, '+');
}


/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query       = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}


/**
 *
 * Implementation Notes for non-IE browsers
 * ----------------------------------------
 * Assigning a URL to the href property of an anchor DOM node, even one attached to the DOM,
 * results both in the normalizing and parsing of the URL.  Normalizing means that a relative
 * URL will be resolved into an absolute URL in the context of the application document.
 * Parsing means that the anchor node's host, hostname, protocol, port, pathname and related
 * properties are all populated to reflect the normalized URL.  This approach has wide
 * compatibility - Safari 1+, Mozilla 1+, Opera 7+,e etc.  See
 * http://wcg.aptana.com/reference/html/api/HTMLAnchorElement.html
 *
 * Implementation Notes for IE
 * ---------------------------
 * IE >= 8 and <= 10 normalizes the URL when assigned to the anchor node similar to the other
 * browsers.  However, the parsed components will not be set if the URL assigned did not specify
 * them.  (e.g. if you assign a.href = "foo", then a.protocol, a.host, etc. will be empty.)  We
 * work around that by performing the parsing in a 2nd step by taking a previously normalized
 * URL (e.g. by assigning to a.href) and assigning it a.href again.  This correctly populates the
 * properties such as protocol, hostname, port, etc.
 *
 * IE7 does not normalize the URL when assigned to an anchor node.  (Apparently, it does, if one
 * uses the inner HTML approach to assign the URL as part of an HTML snippet -
 * http://stackoverflow.com/a/472729)  However, setting img[src] does normalize the URL.
 * Unfortunately, setting img[src] to something like "javascript:foo" on IE throws an exception.
 * Since the primary usage for normalizing URLs is to sanitize such URLs, we can't use that
 * method and IE < 8 is unsupported.
 *
 * References:
 *   http://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
 *   http://wcg.aptana.com/reference/html/api/HTMLAnchorElement.html
 *   http://url.spec.whatwg.org/#urlutils
 *   https://github.com/angular/angular.js/pull/2902
 *   http://james.padolsey.com/javascript/parsing-urls-with-the-dom/
 *
 * @function
 * @param {string} url The URL to be parsed.
 * @description Normalizes and parses a URL.
 * @returns {object} Returns the normalized URL as a dictionary.
 *
 *   | member name   | Description    |
 *   |---------------|----------------|
 *   | href          | A normalized version of the provided URL if it was not an absolute URL |
 *   | protocol      | The protocol including the trailing colon                              |
 *   | host          | The host and port (if the port is non-default) of the normalizedUrl    |
 *   | search        | The search params, minus the question mark                             |
 *   | hash          | The hash string, minus the hash symbol
 *   | hostname      | The hostname
 *   | port          | The port, without ":"
 *   | pathname      | The pathname, beginning with "/"
 *
 */
function urlResolve(url, fixHash) {
    var href = url,
        pathname

    if (utils.msie) {
        // Normalize before parse.  Refer Implementation Notes on why this is
        // done in two steps on IE.
        urlParsingNode.setAttribute("href", href);
        href = urlParsingNode.href;
    }

    urlParsingNode.setAttribute('href', href);

    if (fixHash && urlParsingNode.href.indexOf('#!/') > 0) {
        pathname = urlParsingNode.pathname;
        var end = pathname.lastIndexOf('/');
        pathname = pathname.substr(0, end+1);
        href = pathname + urlParsingNode.hash.substr(3);
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
    }

    // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
    return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/')
            ? urlParsingNode.pathname
            : '/' + urlParsingNode.pathname
    };
}


////////////////////////////////////////////////////////////////
//
function hashCode(obj) {
    if (null === obj || undefined === obj) obj = ""
    if ("string" !== typeof obj) obj = obj.toString()

    /*
    var hash = 0, i, chr, len;
    if (obj.length === 0) return hash;
    for (i = 0, len = obj.length; i < len; i++) {
        chr   = obj.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
    */
    var res = 0,
        len = obj.length
    for (var i = 0; i < len; i++) {
        res = res * 31 + obj.charCodeAt(i)
    }
    return res
}


extend(utils, {
    'copy': copy,
    'shallowCopy': shallowCopy,
    'size': size,
    'extend': extend,
    'inherit': inherit,
    'equals': equals,
    'contains': contains,
    'forEach': forEach,
    'forEachSorted': forEachSorted,
    'noop':noop,
    'bind':bind,
    'toBoolean': toBoolean,
    'toJson': toJson,
    'fromJson': fromJson,
    'arrayRemove': arrayRemove,
    'identity':identity,
    'isUndefined': isUndefined,
    'isDefined': isDefined,
    'isString': isString,
    'isFunction': isFunction,
    'isObject': isObject,
    'isNumber': isNumber,
    'isElement': isElement,
    'isArray': isArray,
    'isDate': isDate,
    'isFile': isFile,
    'isBlob': isBlob,
    'isBoolean': isBoolean,
    'lowercase': lowercase,
    'uppercase': uppercase,
    'urlResolve': urlResolve,
    'hashCode': hashCode,
    'makeMap': makeMap,
    'toKeyValue': toKeyValue,
    'parseKeyValue': parseKeyValue,
    'nextUid': nextUid,
    'encodeUriQuery': encodeUriQuery,
    'encodeUriSegment': encodeUriSegment,
    'callbacks': {counter: 0}
});
