;(function(){
'use strict';

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    throwError()
    return
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  function throwError () {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.exts = [
    '',
    '.js',
    '.json',
    '/index.js',
    '/index.json'
 ];

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  for (var i = 0; i < 5; i++) {
    var fullPath = path + require.exts[i];
    if (require.modules.hasOwnProperty(fullPath)) return fullPath;
    if (require.aliases.hasOwnProperty(fullPath)) return require.aliases[fullPath];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {

  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' === path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }
  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throwError()
    return
  }
  require.aliases[to] = from;

  function throwError () {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' === c) return path.slice(1);
    if ('.' === c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = segs.length;
    while (i--) {
      if (segs[i] === 'deps') {
        break;
      }
    }
    path = segs.slice(0, i + 2).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("yyx990803-vue/src/main.js", function(exports, require, module){
var config      = require('./config'),
    ViewModel   = require('./viewmodel'),
    utils       = require('./utils'),
    makeHash    = utils.hash,
    assetTypes  = ['directive', 'filter', 'partial', 'effect', 'component'],
    // Internal modules that are exposed for plugins
    pluginAPI   = {
        utils: utils,
        config: config,
        transition: require('./transition'),
        observer: require('./observer')
    }

ViewModel.options = config.globalAssets = {
    directives  : require('./directives'),
    filters     : require('./filters'),
    partials    : makeHash(),
    effects     : makeHash(),
    components  : makeHash()
}

/**
 *  Expose asset registration methods
 */
assetTypes.forEach(function (type) {
    ViewModel[type] = function (id, value) {
        var hash = this.options[type + 's']
        if (!hash) {
            hash = this.options[type + 's'] = makeHash()
        }
        if (!value) return hash[id]
        if (type === 'partial') {
            value = utils.parseTemplateOption(value)
        } else if (type === 'component') {
            value = utils.toConstructor(value)
        } else if (type === 'filter') {
            utils.checkFilter(value)
        }
        hash[id] = value
        return this
    }
})

/**
 *  Set config options
 */
ViewModel.config = function (opts, val) {
    if (typeof opts === 'string') {
        if (val === undefined) {
            return config[opts]
        } else {
            config[opts] = val
        }
    } else {
        utils.extend(config, opts)
    }
    return this
}

/**
 *  Expose an interface for plugins
 */
ViewModel.use = function (plugin) {
    if (typeof plugin === 'string') {
        try {
            plugin = require(plugin)
        } catch (e) {
            utils.warn('Cannot find plugin: ' + plugin)
            return
        }
    }

    // additional parameters
    var args = [].slice.call(arguments, 1)
    args.unshift(this)

    if (typeof plugin.install === 'function') {
        plugin.install.apply(plugin, args)
    } else {
        plugin.apply(null, args)
    }
    return this
}

/**
 *  Expose internal modules for plugins
 */
ViewModel.require = function (module) {
    return pluginAPI[module]
}

ViewModel.extend = extend
ViewModel.nextTick = utils.nextTick

/**
 *  Expose the main ViewModel class
 *  and add extend method
 */
function extend (options) {

    var ParentVM = this

    // extend data options need to be copied
    // on instantiation
    if (options.data) {
        options.defaultData = options.data
        delete options.data
    }

    // inherit options
    // but only when the super class is not the native Vue.
    if (ParentVM !== ViewModel) {
        options = inheritOptions(options, ParentVM.options, true)
    }
    utils.processOptions(options)

    var ExtendedVM = function (opts, asParent) {
        if (!asParent) {
            opts = inheritOptions(opts, options, true)
        }
        ParentVM.call(this, opts, true)
    }

    // inherit prototype props
    var proto = ExtendedVM.prototype = Object.create(ParentVM.prototype)
    utils.defProtected(proto, 'constructor', ExtendedVM)

    // allow extended VM to be further extended
    ExtendedVM.extend  = extend
    ExtendedVM.super   = ParentVM
    ExtendedVM.options = options

    // allow extended VM to add its own assets
    assetTypes.forEach(function (type) {
        ExtendedVM[type] = ViewModel[type]
    })

    // allow extended VM to use plugins
    ExtendedVM.use     = ViewModel.use
    ExtendedVM.require = ViewModel.require

    return ExtendedVM
}

/**
 *  Inherit options
 *
 *  For options such as `data`, `vms`, `directives`, 'partials',
 *  they should be further extended. However extending should only
 *  be done at top level.
 *  
 *  `proto` is an exception because it's handled directly on the
 *  prototype.
 *
 *  `el` is an exception because it's not allowed as an
 *  extension option, but only as an instance option.
 */
function inheritOptions (child, parent, topLevel) {
    child = child || {}
    if (!parent) return child
    for (var key in parent) {
        if (key === 'el') continue
        var val = child[key],
            parentVal = parent[key]
        if (topLevel && typeof val === 'function' && parentVal) {
            // merge hook functions into an array
            child[key] = [val]
            if (Array.isArray(parentVal)) {
                child[key] = child[key].concat(parentVal)
            } else {
                child[key].push(parentVal)
            }
        } else if (
            topLevel &&
            (utils.isTrueObject(val) || utils.isTrueObject(parentVal))
            && !(parentVal instanceof ViewModel)
        ) {
            // merge toplevel object options
            child[key] = inheritOptions(val, parentVal)
        } else if (val === undefined) {
            // inherit if child doesn't override
            child[key] = parentVal
        }
    }
    return child
}

module.exports = ViewModel
});
require.register("yyx990803-vue/src/emitter.js", function(exports, require, module){
var slice = [].slice

function Emitter (ctx) {
    this._ctx = ctx || this
}

var EmitterProto = Emitter.prototype

EmitterProto.on = function (event, fn) {
    this._cbs = this._cbs || {}
    ;(this._cbs[event] = this._cbs[event] || [])
        .push(fn)
    return this
}

EmitterProto.once = function (event, fn) {
    var self = this
    this._cbs = this._cbs || {}

    function on () {
        self.off(event, on)
        fn.apply(this, arguments)
    }

    on.fn = fn
    this.on(event, on)
    return this
}

EmitterProto.off = function (event, fn) {
    this._cbs = this._cbs || {}

    // all
    if (!arguments.length) {
        this._cbs = {}
        return this
    }

    // specific event
    var callbacks = this._cbs[event]
    if (!callbacks) return this

    // remove all handlers
    if (arguments.length === 1) {
        delete this._cbs[event]
        return this
    }

    // remove specific handler
    var cb
    for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i]
        if (cb === fn || cb.fn === fn) {
            callbacks.splice(i, 1)
            break
        }
    }
    return this
}

/**
 *  The internal, faster emit with fixed amount of arguments
 *  using Function.call
 */
EmitterProto.emit = function (event, a, b, c) {
    this._cbs = this._cbs || {}
    var callbacks = this._cbs[event]

    if (callbacks) {
        callbacks = callbacks.slice(0)
        for (var i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i].call(this._ctx, a, b, c)
        }
    }

    return this
}

/**
 *  The external emit using Function.apply
 */
EmitterProto.applyEmit = function (event) {
    this._cbs = this._cbs || {}
    var callbacks = this._cbs[event], args

    if (callbacks) {
        callbacks = callbacks.slice(0)
        args = slice.call(arguments, 1)
        for (var i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i].apply(this._ctx, args)
        }
    }

    return this
}

module.exports = Emitter
});
require.register("yyx990803-vue/src/config.js", function(exports, require, module){
var TextParser = require('./text-parser')

module.exports = {
    prefix         : 'v',
    debug          : false,
    silent         : false,
    enterClass     : 'v-enter',
    leaveClass     : 'v-leave',
    interpolate    : true
}

Object.defineProperty(module.exports, 'delimiters', {
    get: function () {
        return TextParser.delimiters
    },
    set: function (delimiters) {
        TextParser.setDelimiters(delimiters)
    }
})
});
require.register("yyx990803-vue/src/utils.js", function(exports, require, module){
var config       = require('./config'),
    toString     = ({}).toString,
    win          = window,
    console      = win.console,
    def          = Object.defineProperty,
    OBJECT       = 'object',
    THIS_RE      = /[^\w]this[^\w]/,
    BRACKET_RE_S = /\['([^']+)'\]/g,
    BRACKET_RE_D = /\["([^"]+)"\]/g,
    hasClassList = 'classList' in document.documentElement,
    ViewModel // late def

var defer =
    win.requestAnimationFrame ||
    win.webkitRequestAnimationFrame ||
    win.setTimeout

/**
 *  Normalize keypath with possible brackets into dot notations
 */
function normalizeKeypath (key) {
    return key.indexOf('[') < 0
        ? key
        : key.replace(BRACKET_RE_S, '.$1')
             .replace(BRACKET_RE_D, '.$1')
}

var utils = module.exports = {

    /**
     *  Convert a string template to a dom fragment
     */
    toFragment: require('./fragment'),

    /**
     *  Parse the various types of template options
     */
    parseTemplateOption: require('./template-parser.js'),

    /**
     *  get a value from an object keypath
     */
    get: function (obj, key) {
        /* jshint eqeqeq: false */
        key = normalizeKeypath(key)
        if (key.indexOf('.') < 0) {
            return obj[key]
        }
        var path = key.split('.'),
            d = -1, l = path.length
        while (++d < l && obj != null) {
            obj = obj[path[d]]
        }
        return obj
    },

    /**
     *  set a value to an object keypath
     */
    set: function (obj, key, val) {
        /* jshint eqeqeq: false */
        key = normalizeKeypath(key)
        if (key.indexOf('.') < 0) {
            obj[key] = val
            return
        }
        var path = key.split('.'),
            d = -1, l = path.length - 1
        while (++d < l) {
            if (obj[path[d]] == null) {
                obj[path[d]] = {}
            }
            obj = obj[path[d]]
        }
        obj[path[d]] = val
    },

    /**
     *  return the base segment of a keypath
     */
    baseKey: function (key) {
        return key.indexOf('.') > 0
            ? key.split('.')[0]
            : key
    },

    /**
     *  Create a prototype-less object
     *  which is a better hash/map
     */
    hash: function () {
        return Object.create(null)
    },

    /**
     *  get an attribute and remove it.
     */
    attr: function (el, type) {
        var attr = config.prefix + '-' + type,
            val = el.getAttribute(attr)
        if (val !== null) {
            el.removeAttribute(attr)
        }
        return val
    },

    /**
     *  Define an ienumerable property
     *  This avoids it being included in JSON.stringify
     *  or for...in loops.
     */
    defProtected: function (obj, key, val, enumerable, writable) {
        def(obj, key, {
            value        : val,
            enumerable   : enumerable,
            writable     : writable,
            configurable : true
        })
    },

    /**
     *  A less bullet-proof but more efficient type check
     *  than Object.prototype.toString
     */
    isObject: function (obj) {
        return typeof obj === OBJECT && obj && !Array.isArray(obj)
    },

    /**
     *  A more accurate but less efficient type check
     */
    isTrueObject: function (obj) {
        return toString.call(obj) === '[object Object]'
    },

    /**
     *  Most simple bind
     *  enough for the usecase and fast than native bind()
     */
    bind: function (fn, ctx) {
        return function (arg) {
            return fn.call(ctx, arg)
        }
    },

    /**
     *  Make sure null and undefined output empty string
     */
    guard: function (value) {
        /* jshint eqeqeq: false, eqnull: true */
        return value == null
            ? ''
            : (typeof value == 'object')
                ? JSON.stringify(value)
                : value
    },

    /**
     *  When setting value on the VM, parse possible numbers
     */
    checkNumber: function (value) {
        return (isNaN(value) || value === null || typeof value === 'boolean')
            ? value
            : Number(value)
    },

    /**
     *  simple extend
     */
    extend: function (obj, ext) {
        for (var key in ext) {
            if (obj[key] !== ext[key]) {
                obj[key] = ext[key]
            }
        }
        return obj
    },

    /**
     *  filter an array with duplicates into uniques
     */
    unique: function (arr) {
        var hash = utils.hash(),
            i = arr.length,
            key, res = []
        while (i--) {
            key = arr[i]
            if (hash[key]) continue
            hash[key] = 1
            res.push(key)
        }
        return res
    },

    /**
     *  Convert the object to a ViewModel constructor
     *  if it is not already one
     */
    toConstructor: function (obj) {
        ViewModel = ViewModel || require('./viewmodel')
        return utils.isObject(obj)
            ? ViewModel.extend(obj)
            : typeof obj === 'function'
                ? obj
                : null
    },

    /**
     *  Check if a filter function contains references to `this`
     *  If yes, mark it as a computed filter.
     */
    checkFilter: function (filter) {
        if (THIS_RE.test(filter.toString())) {
            filter.computed = true
        }
    },

    /**
     *  convert certain option values to the desired format.
     */
    processOptions: function (options) {
        var components = options.components,
            partials   = options.partials,
            template   = options.template,
            filters    = options.filters,
            key
        if (components) {
            for (key in components) {
                components[key] = utils.toConstructor(components[key])
            }
        }
        if (partials) {
            for (key in partials) {
                partials[key] = utils.parseTemplateOption(partials[key])
            }
        }
        if (filters) {
            for (key in filters) {
                utils.checkFilter(filters[key])
            }
        }
        if (template) {
            options.template = utils.parseTemplateOption(template)
        }
    },

    /**
     *  used to defer batch updates
     */
    nextTick: function (cb) {
        defer(cb, 0)
    },

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

    /**
     *  Convert an object to Array
     *  used in v-repeat and array filters
     */
    objectToArray: function (obj) {
        var res = [], val, data
        for (var key in obj) {
            val = obj[key]
            data = utils.isObject(val)
                ? val
                : { $value: val }
            data.$key = key
            res.push(data)
        }
        return res
    }
}

enableDebug()
function enableDebug () {
    /**
     *  log for debugging
     */
    utils.log = function (msg) {
        if (config.debug && console) {
            console.log(msg)
        }
    }
    
    /**
     *  warnings, traces by default
     *  can be suppressed by `silent` option.
     */
    utils.warn = function (msg) {
        if (!config.silent && console) {
            console.warn(msg)
            if (config.debug && console.trace) {
                console.trace()
            }
        }
    }
}
});
require.register("yyx990803-vue/src/fragment.js", function(exports, require, module){
// string -> DOM conversion
// wrappers originally from jQuery, scooped from component/domify
var map = {
    legend   : [1, '<fieldset>', '</fieldset>'],
    tr       : [2, '<table><tbody>', '</tbody></table>'],
    col      : [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
    _default : [0, '', '']
}

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>']

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>']

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>']

map.text =
map.circle =
map.ellipse =
map.line =
map.path =
map.polygon =
map.polyline =
map.rect = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>']

var TAG_RE = /<([\w:]+)/

module.exports = function (templateString) {
    var frag = document.createDocumentFragment(),
        m = TAG_RE.exec(templateString)
    // text only
    if (!m) {
        frag.appendChild(document.createTextNode(templateString))
        return frag
    }

    var tag = m[1],
        wrap = map[tag] || map._default,
        depth = wrap[0],
        prefix = wrap[1],
        suffix = wrap[2],
        node = document.createElement('div')

    node.innerHTML = prefix + templateString.trim() + suffix
    while (depth--) node = node.lastChild

    // one element
    if (node.firstChild === node.lastChild) {
        frag.appendChild(node.firstChild)
        return frag
    }

    // multiple nodes, return a fragment
    var child
    /* jshint boss: true */
    while (child = node.firstChild) {
        if (node.nodeType === 1) {
            frag.appendChild(child)
        }
    }
    return frag
}
});
require.register("yyx990803-vue/src/compiler.js", function(exports, require, module){
var Emitter     = require('./emitter'),
    Observer    = require('./observer'),
    config      = require('./config'),
    utils       = require('./utils'),
    Binding     = require('./binding'),
    Directive   = require('./directive'),
    TextParser  = require('./text-parser'),
    DepsParser  = require('./deps-parser'),
    ExpParser   = require('./exp-parser'),
    ViewModel,
    
    // cache methods
    slice       = [].slice,
    extend      = utils.extend,
    hasOwn      = ({}).hasOwnProperty,
    def         = Object.defineProperty,

    // hooks to register
    hooks = [
        'created', 'ready',
        'beforeDestroy', 'afterDestroy',
        'attached', 'detached'
    ],

    // list of priority directives
    // that needs to be checked in specific order
    priorityDirectives = [
        'if',
        'repeat',
        'view',
        'component'
    ]

/**
 *  The DOM compiler
 *  scans a DOM node and compile bindings for a ViewModel
 */
function Compiler (vm, options) {

    var compiler = this,
        key, i

    // default state
    compiler.init       = true
    compiler.destroyed  = false

    // process and extend options
    options = compiler.options = options || {}
    utils.processOptions(options)

    // copy compiler options
    extend(compiler, options.compilerOptions)
    // repeat indicates this is a v-repeat instance
    compiler.repeat   = compiler.repeat || false
    // expCache will be shared between v-repeat instances
    compiler.expCache = compiler.expCache || {}

    // initialize element
    var el = compiler.el = compiler.setupElement(options)
    utils.log('\nnew VM instance: ' + el.tagName + '\n')

    // set other compiler properties
    compiler.vm       = el.vue_vm = vm
    compiler.bindings = utils.hash()
    compiler.dirs     = []
    compiler.deferred = []
    compiler.computed = []
    compiler.children = []
    compiler.emitter  = new Emitter(vm)

    // VM ---------------------------------------------------------------------

    // set VM properties
    vm.$         = {}
    vm.$el       = el
    vm.$options  = options
    vm.$compiler = compiler
    vm.$event    = null

    // set parent & root
    var parentVM = options.parent
    if (parentVM) {
        compiler.parent = parentVM.$compiler
        parentVM.$compiler.children.push(compiler)
        vm.$parent = parentVM
        // inherit lazy option
        if (!('lazy' in options)) {
            options.lazy = compiler.parent.options.lazy
        }
    }
    vm.$root = getRoot(compiler).vm

    // DATA -------------------------------------------------------------------

    // setup observer
    // this is necesarry for all hooks and data observation events
    compiler.setupObserver()

    // create bindings for computed properties
    if (options.methods) {
        for (key in options.methods) {
            compiler.createBinding(key)
        }
    }

    // create bindings for methods
    if (options.computed) {
        for (key in options.computed) {
            compiler.createBinding(key)
        }
    }

    // initialize data
    var data = compiler.data = options.data || {},
        defaultData = options.defaultData
    if (defaultData) {
        for (key in defaultData) {
            if (!hasOwn.call(data, key)) {
                data[key] = defaultData[key]
            }
        }
    }

    // copy paramAttributes
    var params = options.paramAttributes
    if (params) {
        i = params.length
        while (i--) {
            data[params[i]] = utils.checkNumber(
                compiler.eval(
                    el.getAttribute(params[i])
                )
            )
        }
    }

    // copy data properties to vm
    // so user can access them in the created hook
    extend(vm, data)
    vm.$data = data

    // beforeCompile hook
    compiler.execHook('created')

    // the user might have swapped the data ...
    data = compiler.data = vm.$data

    // user might also set some properties on the vm
    // in which case we should copy back to $data
    var vmProp
    for (key in vm) {
        vmProp = vm[key]
        if (
            key.charAt(0) !== '$' &&
            data[key] !== vmProp &&
            typeof vmProp !== 'function'
        ) {
            data[key] = vmProp
        }
    }

    // now we can observe the data.
    // this will convert data properties to getter/setters
    // and emit the first batch of set events, which will
    // in turn create the corresponding bindings.
    compiler.observeData(data)

    // COMPILE ----------------------------------------------------------------

    // before compiling, resolve content insertion points
    if (options.template) {
        this.resolveContent()
    }

    // now parse the DOM and bind directives.
    // During this stage, we will also create bindings for
    // encountered keypaths that don't have a binding yet.
    compiler.compile(el, true)

    // Any directive that creates child VMs are deferred
    // so that when they are compiled, all bindings on the
    // parent VM have been created.
    i = compiler.deferred.length
    while (i--) {
        compiler.bindDirective(compiler.deferred[i])
    }
    compiler.deferred = null

    // extract dependencies for computed properties.
    // this will evaluated all collected computed bindings
    // and collect get events that are emitted.
    if (this.computed.length) {
        DepsParser.parse(this.computed)
    }

    // done!
    compiler.init = false

    // post compile / ready hook
    compiler.execHook('ready')
}

var CompilerProto = Compiler.prototype

/**
 *  Initialize the VM/Compiler's element.
 *  Fill it in with the template if necessary.
 */
CompilerProto.setupElement = function (options) {
    // create the node first
    var el = typeof options.el === 'string'
        ? document.querySelector(options.el)
        : options.el || document.createElement(options.tagName || 'div')

    var template = options.template,
        child, replacer, i, attr, attrs

    if (template) {
        // collect anything already in there
        if (el.hasChildNodes()) {
            this.rawContent = document.createElement('div')
            /* jshint boss: true */
            while (child = el.firstChild) {
                this.rawContent.appendChild(child)
            }
        }
        // replace option: use the first node in
        // the template directly
        if (options.replace && template.firstChild === template.lastChild) {
            replacer = template.firstChild.cloneNode(true)
            if (el.parentNode) {
                el.parentNode.insertBefore(replacer, el)
                el.parentNode.removeChild(el)
            }
            // copy over attributes
            if (el.hasAttributes()) {
                i = el.attributes.length
                while (i--) {
                    attr = el.attributes[i]
                    replacer.setAttribute(attr.name, attr.value)
                }
            }
            // replace
            el = replacer
        } else {
            el.appendChild(template.cloneNode(true))
        }

    }

    // apply element options
    if (options.id) el.id = options.id
    if (options.className) el.className = options.className
    attrs = options.attributes
    if (attrs) {
        for (attr in attrs) {
            el.setAttribute(attr, attrs[attr])
        }
    }

    return el
}

/**
 *  Deal with <content> insertion points
 *  per the Web Components spec
 */
CompilerProto.resolveContent = function () {

    var outlets = slice.call(this.el.getElementsByTagName('content')),
        raw = this.rawContent,
        outlet, select, i, j, main

    i = outlets.length
    if (i) {
        // first pass, collect corresponding content
        // for each outlet.
        while (i--) {
            outlet = outlets[i]
            if (raw) {
                select = outlet.getAttribute('select')
                if (select) { // select content
                    outlet.content =
                        slice.call(raw.querySelectorAll(select))
                } else { // default content
                    main = outlet
                }
            } else { // fallback content
                outlet.content =
                    slice.call(outlet.childNodes)
            }
        }
        // second pass, actually insert the contents
        for (i = 0, j = outlets.length; i < j; i++) {
            outlet = outlets[i]
            if (outlet === main) continue
            insert(outlet, outlet.content)
        }
        // finally insert the main content
        if (raw && main) {
            insert(main, slice.call(raw.childNodes))
        }
    }

    function insert (outlet, contents) {
        var parent = outlet.parentNode,
            i = 0, j = contents.length
        for (; i < j; i++) {
            parent.insertBefore(contents[i], outlet)
        }
        parent.removeChild(outlet)
    }

    this.rawContent = null
}

/**
 *  Setup observer.
 *  The observer listens for get/set/mutate events on all VM
 *  values/objects and trigger corresponding binding updates.
 *  It also listens for lifecycle hooks.
 */
CompilerProto.setupObserver = function () {

    var compiler = this,
        bindings = compiler.bindings,
        options  = compiler.options,
        observer = compiler.observer = new Emitter(compiler.vm)

    // a hash to hold event proxies for each root level key
    // so they can be referenced and removed later
    observer.proxies = {}

    // add own listeners which trigger binding updates
    observer
        .on('get', onGet)
        .on('set', onSet)
        .on('mutate', onSet)

    // register hooks
    var i = hooks.length, j, hook, fns
    while (i--) {
        hook = hooks[i]
        fns = options[hook]
        if (Array.isArray(fns)) {
            j = fns.length
            // since hooks were merged with child at head,
            // we loop reversely.
            while (j--) {
                registerHook(hook, fns[j])
            }
        } else if (fns) {
            registerHook(hook, fns)
        }
    }

    // broadcast attached/detached hooks
    observer
        .on('hook:attached', function () {
            broadcast(1)
        })
        .on('hook:detached', function () {
            broadcast(0)
        })

    function onGet (key) {
        check(key)
        DepsParser.catcher.emit('get', bindings[key])
    }

    function onSet (key, val, mutation) {
        observer.emit('change:' + key, val, mutation)
        check(key)
        bindings[key].update(val)
    }

    function registerHook (hook, fn) {
        observer.on('hook:' + hook, function () {
            fn.call(compiler.vm)
        })
    }

    function broadcast (event) {
        var children = compiler.children
        if (children) {
            var child, i = children.length
            while (i--) {
                child = children[i]
                if (child.el.parentNode) {
                    event = 'hook:' + (event ? 'attached' : 'detached')
                    child.observer.emit(event)
                    child.emitter.emit(event)
                }
            }
        }
    }

    function check (key) {
        if (!bindings[key]) {
            compiler.createBinding(key)
        }
    }
}

CompilerProto.observeData = function (data) {

    var compiler = this,
        observer = compiler.observer

    // recursively observe nested properties
    Observer.observe(data, '', observer)

    // also create binding for top level $data
    // so it can be used in templates too
    var $dataBinding = compiler.bindings['$data'] = new Binding(compiler, '$data')
    $dataBinding.update(data)

    // allow $data to be swapped
    def(compiler.vm, '$data', {
        get: function () {
            compiler.observer.emit('get', '$data')
            return compiler.data
        },
        set: function (newData) {
            var oldData = compiler.data
            Observer.unobserve(oldData, '', observer)
            compiler.data = newData
            Observer.copyPaths(newData, oldData)
            Observer.observe(newData, '', observer)
            update()
        }
    })

    // emit $data change on all changes
    observer
        .on('set', onSet)
        .on('mutate', onSet)

    function onSet (key) {
        if (key !== '$data') update()
    }

    function update () {
        $dataBinding.update(compiler.data)
        observer.emit('change:$data', compiler.data)
    }
}

/**
 *  Compile a DOM node (recursive)
 */
CompilerProto.compile = function (node, root) {
    var nodeType = node.nodeType
    if (nodeType === 1 && node.tagName !== 'SCRIPT') { // a normal node
        this.compileElement(node, root)
    } else if (nodeType === 3 && config.interpolate) {
        this.compileTextNode(node)
    }
}

/**
 *  Check for a priority directive
 *  If it is present and valid, return true to skip the rest
 */
CompilerProto.checkPriorityDir = function (dirname, node, root) {
    var expression, directive, Ctor
    if (
        dirname === 'component' &&
        root !== true &&
        (Ctor = this.resolveComponent(node, undefined, true))
    ) {
        directive = this.parseDirective(dirname, '', node)
        directive.Ctor = Ctor
    } else {
        expression = utils.attr(node, dirname)
        directive = expression && this.parseDirective(dirname, expression, node)
    }
    if (directive) {
        if (root === true) {
            utils.warn(
                'Directive v-' + dirname + ' cannot be used on an already instantiated ' +
                'VM\'s root node. Use it from the parent\'s template instead.'
            )
            return
        }
        this.deferred.push(directive)
        return true
    }
}

/**
 *  Compile normal directives on a node
 */
CompilerProto.compileElement = function (node, root) {

    // textarea is pretty annoying
    // because its value creates childNodes which
    // we don't want to compile.
    if (node.tagName === 'TEXTAREA' && node.value) {
        node.value = this.eval(node.value)
    }

    // only compile if this element has attributes
    // or its tagName contains a hyphen (which means it could
    // potentially be a custom element)
    if (node.hasAttributes() || node.tagName.indexOf('-') > -1) {

        // skip anything with v-pre
        if (utils.attr(node, 'pre') !== null) {
            return
        }

        var i, l, j, k

        // check priority directives.
        // if any of them are present, it will take over the node with a childVM
        // so we can skip the rest
        for (i = 0, l = priorityDirectives.length; i < l; i++) {
            if (this.checkPriorityDir(priorityDirectives[i], node, root)) {
                return
            }
        }

        // check transition & animation properties
        node.vue_trans  = utils.attr(node, 'transition')
        node.vue_anim   = utils.attr(node, 'animation')
        node.vue_effect = this.eval(utils.attr(node, 'effect'))

        var prefix = config.prefix + '-',
            params = this.options.paramAttributes,
            attr, attrname, isDirective, exp, directives, directive, dirname

        // v-with has special priority among the rest
        // it needs to pull in the value from the parent before
        // computed properties are evaluated, because at this stage
        // the computed properties have not set up their dependencies yet.
        if (root) {
            var withExp = utils.attr(node, 'with')
            if (withExp) {
                directives = this.parseDirective('with', withExp, node, true)
                for (j = 0, k = directives.length; j < k; j++) {
                    this.bindDirective(directives[j], this.parent)
                }
            }
        }

        var attrs = slice.call(node.attributes)
        for (i = 0, l = attrs.length; i < l; i++) {

            attr = attrs[i]
            attrname = attr.name
            isDirective = false

            if (attrname.indexOf(prefix) === 0) {
                // a directive - split, parse and bind it.
                isDirective = true
                dirname = attrname.slice(prefix.length)
                // build with multiple: true
                directives = this.parseDirective(dirname, attr.value, node, true)
                // loop through clauses (separated by ",")
                // inside each attribute
                for (j = 0, k = directives.length; j < k; j++) {
                    this.bindDirective(directives[j])
                }
            } else if (config.interpolate) {
                // non directive attribute, check interpolation tags
                exp = TextParser.parseAttr(attr.value)
                if (exp) {
                    directive = this.parseDirective('attr', exp, node)
                    directive.arg = attrname
                    if (params && params.indexOf(attrname) > -1) {
                        // a param attribute... we should use the parent binding
                        // to avoid circular updates like size={{size}}
                        this.bindDirective(directive, this.parent)
                    } else {
                        this.bindDirective(directive)
                    }
                }
            }

            if (isDirective && dirname !== 'cloak') {
                node.removeAttribute(attrname)
            }
        }

    }

    // recursively compile childNodes
    if (node.hasChildNodes()) {
        slice.call(node.childNodes).forEach(this.compile, this)
    }
}

/**
 *  Compile a text node
 */
CompilerProto.compileTextNode = function (node) {

    var tokens = TextParser.parse(node.nodeValue)
    if (!tokens) return
    var el, token, directive

    for (var i = 0, l = tokens.length; i < l; i++) {

        token = tokens[i]
        directive = null

        if (token.key) { // a binding
            if (token.key.charAt(0) === '>') { // a partial
                el = document.createComment('ref')
                directive = this.parseDirective('partial', token.key.slice(1), el)
            } else {
                if (!token.html) { // text binding
                    el = document.createTextNode('')
                    directive = this.parseDirective('text', token.key, el)
                } else { // html binding
                    el = document.createComment(config.prefix + '-html')
                    directive = this.parseDirective('html', token.key, el)
                }
            }
        } else { // a plain string
            el = document.createTextNode(token)
        }

        // insert node
        node.parentNode.insertBefore(el, node)
        // bind directive
        this.bindDirective(directive)

    }
    node.parentNode.removeChild(node)
}

/**
 *  Parse a directive name/value pair into one or more
 *  directive instances
 */
CompilerProto.parseDirective = function (name, value, el, multiple) {
    var compiler = this,
        definition = compiler.getOption('directives', name)
    if (definition) {
        // parse into AST-like objects
        var asts = Directive.parse(value)
        return multiple
            ? asts.map(build)
            : build(asts[0])
    }
    function build (ast) {
        return new Directive(name, ast, definition, compiler, el)
    }
}

/**
 *  Add a directive instance to the correct binding & viewmodel
 */
CompilerProto.bindDirective = function (directive, bindingOwner) {

    if (!directive) return

    // keep track of it so we can unbind() later
    this.dirs.push(directive)

    // for empty or literal directives, simply call its bind()
    // and we're done.
    if (directive.isEmpty || directive.isLiteral) {
        if (directive.bind) directive.bind()
        return
    }

    // otherwise, we got more work to do...
    var binding,
        compiler = bindingOwner || this,
        key      = directive.key

    if (directive.isExp) {
        // expression bindings are always created on current compiler
        binding = compiler.createBinding(key, directive)
    } else {
        // recursively locate which compiler owns the binding
        while (compiler) {
            if (compiler.hasKey(key)) {
                break
            } else {
                compiler = compiler.parent
            }
        }
        compiler = compiler || this
        binding = compiler.bindings[key] || compiler.createBinding(key)
    }
    binding.dirs.push(directive)
    directive.binding = binding

    var value = binding.val()
    // invoke bind hook if exists
    if (directive.bind) {
        directive.bind(value)
    }
    // set initial value
    directive.$update(value, true)
}

/**
 *  Create binding and attach getter/setter for a key to the viewmodel object
 */
CompilerProto.createBinding = function (key, directive) {

    utils.log('  created binding: ' + key)

    var compiler = this,
        methods  = compiler.options.methods,
        isExp    = directive && directive.isExp,
        isFn     = (directive && directive.isFn) || (methods && methods[key]),
        bindings = compiler.bindings,
        computed = compiler.options.computed,
        binding  = new Binding(compiler, key, isExp, isFn)

    if (isExp) {
        // expression bindings are anonymous
        compiler.defineExp(key, binding, directive)
    } else if (isFn) {
        bindings[key] = binding
        compiler.defineVmProp(key, binding, methods[key])
    } else {
        bindings[key] = binding
        if (binding.root) {
            // this is a root level binding. we need to define getter/setters for it.
            if (computed && computed[key]) {
                // computed property
                compiler.defineComputed(key, binding, computed[key])
            } else if (key.charAt(0) !== '$') {
                // normal property
                compiler.defineDataProp(key, binding)
            } else {
                // properties that start with $ are meta properties
                // they should be kept on the vm but not in the data object.
                compiler.defineVmProp(key, binding, compiler.data[key])
                delete compiler.data[key]
            }
        } else if (computed && computed[utils.baseKey(key)]) {
            // nested path on computed property
            compiler.defineExp(key, binding)
        } else {
            // ensure path in data so that computed properties that
            // access the path don't throw an error and can collect
            // dependencies
            Observer.ensurePath(compiler.data, key)
            var parentKey = key.slice(0, key.lastIndexOf('.'))
            if (!bindings[parentKey]) {
                // this is a nested value binding, but the binding for its parent
                // has not been created yet. We better create that one too.
                compiler.createBinding(parentKey)
            }
        }
    }
    return binding
}

/**
 *  Define the getter/setter to proxy a root-level
 *  data property on the VM
 */
CompilerProto.defineDataProp = function (key, binding) {
    var compiler = this,
        data     = compiler.data,
        ob       = data.__emitter__

    // make sure the key is present in data
    // so it can be observed
    if (!(hasOwn.call(data, key))) {
        data[key] = undefined
    }

    // if the data object is already observed, but the key
    // is not observed, we need to add it to the observed keys.
    if (ob && !(hasOwn.call(ob.values, key))) {
        Observer.convertKey(data, key)
    }

    binding.value = data[key]

    def(compiler.vm, key, {
        get: function () {
            return compiler.data[key]
        },
        set: function (val) {
            compiler.data[key] = val
        }
    })
}

/**
 *  Define a vm property, e.g. $index, $key, or mixin methods
 *  which are bindable but only accessible on the VM,
 *  not in the data.
 */
CompilerProto.defineVmProp = function (key, binding, value) {
    var ob = this.observer
    binding.value = value
    def(this.vm, key, {
        get: function () {
            if (Observer.shouldGet) ob.emit('get', key)
            return binding.value
        },
        set: function (val) {
            ob.emit('set', key, val)
        }
    })
}

/**
 *  Define an expression binding, which is essentially
 *  an anonymous computed property
 */
CompilerProto.defineExp = function (key, binding, directive) {
    var computedKey = directive && directive.computedKey,
        exp         = computedKey ? directive.expression : key,
        getter      = this.expCache[exp]
    if (!getter) {
        getter = this.expCache[exp] = ExpParser.parse(computedKey || key, this)
    }
    if (getter) {
        this.markComputed(binding, getter)
    }
}

/**
 *  Define a computed property on the VM
 */
CompilerProto.defineComputed = function (key, binding, value) {
    this.markComputed(binding, value)
    def(this.vm, key, {
        get: binding.value.$get,
        set: binding.value.$set
    })
}

/**
 *  Process a computed property binding
 *  so its getter/setter are bound to proper context
 */
CompilerProto.markComputed = function (binding, value) {
    binding.isComputed = true
    // bind the accessors to the vm
    if (binding.isFn) {
        binding.value = value
    } else {
        if (typeof value === 'function') {
            value = { $get: value }
        }
        binding.value = {
            $get: utils.bind(value.$get, this.vm),
            $set: value.$set
                ? utils.bind(value.$set, this.vm)
                : undefined
        }
    }
    // keep track for dep parsing later
    this.computed.push(binding)
}

/**
 *  Retrive an option from the compiler
 */
CompilerProto.getOption = function (type, id, silent) {
    var opts = this.options,
        parent = this.parent,
        globalAssets = config.globalAssets,
        res = (opts[type] && opts[type][id]) || (
            parent
                ? parent.getOption(type, id, silent)
                : globalAssets[type] && globalAssets[type][id]
        )
    if (!res && !silent && typeof id === 'string') {
        utils.warn('Unknown ' + type.slice(0, -1) + ': ' + id)
    }
    return res
}

/**
 *  Emit lifecycle events to trigger hooks
 */
CompilerProto.execHook = function (event) {
    event = 'hook:' + event
    this.observer.emit(event)
    this.emitter.emit(event)
}

/**
 *  Check if a compiler's data contains a keypath
 */
CompilerProto.hasKey = function (key) {
    var baseKey = utils.baseKey(key)
    return hasOwn.call(this.data, baseKey) ||
        hasOwn.call(this.vm, baseKey)
}

/**
 *  Do a one-time eval of a string that potentially
 *  includes bindings. It accepts additional raw data
 *  because we need to dynamically resolve v-component
 *  before a childVM is even compiled...
 */
CompilerProto.eval = function (exp, data) {
    var parsed = TextParser.parseAttr(exp)
    return parsed
        ? ExpParser.eval(parsed, this, data)
        : exp
}

/**
 *  Resolve a Component constructor for an element
 *  with the data to be used
 */
CompilerProto.resolveComponent = function (node, data, test) {

    // late require to avoid circular deps
    ViewModel = ViewModel || require('./viewmodel')

    var exp     = utils.attr(node, 'component'),
        tagName = node.tagName,
        id      = this.eval(exp, data),
        tagId   = (tagName.indexOf('-') > 0 && tagName.toLowerCase()),
        Ctor    = this.getOption('components', id || tagId, true)

    if (id && !Ctor) {
        utils.warn('Unknown component: ' + id)
    }

    return test
        ? exp === ''
            ? ViewModel
            : Ctor
        : Ctor || ViewModel
}

/**
 *  Unbind and remove element
 */
CompilerProto.destroy = function (noRemove) {

    // avoid being called more than once
    // this is irreversible!
    if (this.destroyed) return

    var compiler = this,
        i, j, key, dir, dirs, binding,
        vm          = compiler.vm,
        el          = compiler.el,
        directives  = compiler.dirs,
        computed    = compiler.computed,
        bindings    = compiler.bindings,
        children    = compiler.children,
        parent      = compiler.parent

    compiler.execHook('beforeDestroy')

    // unobserve data
    Observer.unobserve(compiler.data, '', compiler.observer)

    // destroy all children
    // do not remove their elements since the parent
    // may have transitions and the children may not
    i = children.length
    while (i--) {
        children[i].destroy(true)
    }

    // unbind all direcitves
    i = directives.length
    while (i--) {
        dir = directives[i]
        // if this directive is an instance of an external binding
        // e.g. a directive that refers to a variable on the parent VM
        // we need to remove it from that binding's directives
        // * empty and literal bindings do not have binding.
        if (dir.binding && dir.binding.compiler !== compiler) {
            dirs = dir.binding.dirs
            if (dirs) {
                j = dirs.indexOf(dir)
                if (j > -1) dirs.splice(j, 1)
            }
        }
        dir.$unbind()
    }

    // unbind all computed, anonymous bindings
    i = computed.length
    while (i--) {
        computed[i].unbind()
    }

    // unbind all keypath bindings
    for (key in bindings) {
        binding = bindings[key]
        if (binding) {
            binding.unbind()
        }
    }

    // remove self from parent
    if (parent) {
        j = parent.children.indexOf(compiler)
        if (j > -1) parent.children.splice(j, 1)
    }

    // finally remove dom element
    if (!noRemove) {
        if (el === document.body) {
            el.innerHTML = ''
        } else {
            vm.$remove()
        }
    }
    el.vue_vm = null

    compiler.destroyed = true
    // emit destroy hook
    compiler.execHook('afterDestroy')

    // finally, unregister all listeners
    compiler.observer.off()
    compiler.emitter.off()
}

// Helpers --------------------------------------------------------------------

/**
 *  shorthand for getting root compiler
 */
function getRoot (compiler) {
    while (compiler.parent) {
        compiler = compiler.parent
    }
    return compiler
}

module.exports = Compiler
});
require.register("yyx990803-vue/src/viewmodel.js", function(exports, require, module){
var Compiler   = require('./compiler'),
    utils      = require('./utils'),
    transition = require('./transition'),
    Batcher    = require('./batcher'),
    slice      = [].slice,
    def        = utils.defProtected,
    nextTick   = utils.nextTick,

    // batch $watch callbacks
    watcherBatcher = new Batcher(),
    watcherId      = 1

/**
 *  ViewModel exposed to the user that holds data,
 *  computed properties, event handlers
 *  and a few reserved methods
 */
function ViewModel (options) {
    // compile if options passed, if false return. options are passed directly to compiler
    if (options === false) return
    new Compiler(this, options)
}

// All VM prototype methods are inenumerable
// so it can be stringified/looped through as raw data
var VMProto = ViewModel.prototype

/**
 *  init allows config compilation after instantiation:
 *    var a = new Vue(false)
 *    a.init(config)
 */
def(VMProto, '$init', function (options) {
    new Compiler(this, options)
})

/**
 *  Convenience function to get a value from
 *  a keypath
 */
def(VMProto, '$get', function (key) {
    var val = utils.get(this, key)
    return val === undefined && this.$parent
        ? this.$parent.$get(key)
        : val
})

/**
 *  Convenience function to set an actual nested value
 *  from a flat key string. Used in directives.
 */
def(VMProto, '$set', function (key, value) {
    utils.set(this, key, value)
})

/**
 *  watch a key on the viewmodel for changes
 *  fire callback with new value
 */
def(VMProto, '$watch', function (key, callback) {
    // save a unique id for each watcher
    var id = watcherId++,
        self = this
    function on () {
        var args = slice.call(arguments)
        watcherBatcher.push({
            id: id,
            override: true,
            execute: function () {
                callback.apply(self, args)
            }
        })
    }
    callback._fn = on
    self.$compiler.observer.on('change:' + key, on)
})

/**
 *  unwatch a key
 */
def(VMProto, '$unwatch', function (key, callback) {
    // workaround here
    // since the emitter module checks callback existence
    // by checking the length of arguments
    var args = ['change:' + key],
        ob = this.$compiler.observer
    if (callback) args.push(callback._fn)
    ob.off.apply(ob, args)
})

/**
 *  unbind everything, remove everything
 */
def(VMProto, '$destroy', function (noRemove) {
    this.$compiler.destroy(noRemove)
})

/**
 *  broadcast an event to all child VMs recursively.
 */
def(VMProto, '$broadcast', function () {
    var children = this.$compiler.children,
        i = children.length,
        child
    while (i--) {
        child = children[i]
        child.emitter.applyEmit.apply(child.emitter, arguments)
        child.vm.$broadcast.apply(child.vm, arguments)
    }
})

/**
 *  emit an event that propagates all the way up to parent VMs.
 */
def(VMProto, '$dispatch', function () {
    var compiler = this.$compiler,
        emitter = compiler.emitter,
        parent = compiler.parent
    emitter.applyEmit.apply(emitter, arguments)
    if (parent) {
        parent.vm.$dispatch.apply(parent.vm, arguments)
    }
})

/**
 *  delegate on/off/once to the compiler's emitter
 */
;['emit', 'on', 'off', 'once'].forEach(function (method) {
    // internal emit has fixed number of arguments.
    // exposed emit uses the external version
    // with fn.apply.
    var realMethod = method === 'emit'
        ? 'applyEmit'
        : method
    def(VMProto, '$' + method, function () {
        var emitter = this.$compiler.emitter
        emitter[realMethod].apply(emitter, arguments)
    })
})

// DOM convenience methods

def(VMProto, '$appendTo', function (target, cb) {
    target = query(target)
    var el = this.$el
    transition(el, 1, function () {
        target.appendChild(el)
        if (cb) nextTick(cb)
    }, this.$compiler)
})

def(VMProto, '$remove', function (cb) {
    var el = this.$el
    transition(el, -1, function () {
        if (el.parentNode) {
            el.parentNode.removeChild(el)
        }
        if (cb) nextTick(cb)
    }, this.$compiler)
})

def(VMProto, '$before', function (target, cb) {
    target = query(target)
    var el = this.$el
    transition(el, 1, function () {
        target.parentNode.insertBefore(el, target)
        if (cb) nextTick(cb)
    }, this.$compiler)
})

def(VMProto, '$after', function (target, cb) {
    target = query(target)
    var el = this.$el
    transition(el, 1, function () {
        if (target.nextSibling) {
            target.parentNode.insertBefore(el, target.nextSibling)
        } else {
            target.parentNode.appendChild(el)
        }
        if (cb) nextTick(cb)
    }, this.$compiler)
})

function query (el) {
    return typeof el === 'string'
        ? document.querySelector(el)
        : el
}

module.exports = ViewModel

});
require.register("yyx990803-vue/src/binding.js", function(exports, require, module){
var Batcher        = require('./batcher'),
    bindingBatcher = new Batcher(),
    bindingId      = 1

/**
 *  Binding class.
 *
 *  each property on the viewmodel has one corresponding Binding object
 *  which has multiple directive instances on the DOM
 *  and multiple computed property dependents
 */
function Binding (compiler, key, isExp, isFn) {
    this.id = bindingId++
    this.value = undefined
    this.isExp = !!isExp
    this.isFn = isFn
    this.root = !this.isExp && key.indexOf('.') === -1
    this.compiler = compiler
    this.key = key
    this.dirs = []
    this.subs = []
    this.deps = []
    this.unbound = false
}

var BindingProto = Binding.prototype

/**
 *  Update value and queue instance updates.
 */
BindingProto.update = function (value) {
    if (!this.isComputed || this.isFn) {
        this.value = value
    }
    if (this.dirs.length || this.subs.length) {
        var self = this
        bindingBatcher.push({
            id: this.id,
            execute: function () {
                if (!self.unbound) {
                    self._update()
                }
            }
        })
    }
}

/**
 *  Actually update the directives.
 */
BindingProto._update = function () {
    var i = this.dirs.length,
        value = this.val()
    while (i--) {
        this.dirs[i].$update(value)
    }
    this.pub()
}

/**
 *  Return the valuated value regardless
 *  of whether it is computed or not
 */
BindingProto.val = function () {
    return this.isComputed && !this.isFn
        ? this.value.$get()
        : this.value
}

/**
 *  Notify computed properties that depend on this binding
 *  to update themselves
 */
BindingProto.pub = function () {
    var i = this.subs.length
    while (i--) {
        this.subs[i].update()
    }
}

/**
 *  Unbind the binding, remove itself from all of its dependencies
 */
BindingProto.unbind = function () {
    // Indicate this has been unbound.
    // It's possible this binding will be in
    // the batcher's flush queue when its owner
    // compiler has already been destroyed.
    this.unbound = true
    var i = this.dirs.length
    while (i--) {
        this.dirs[i].$unbind()
    }
    i = this.deps.length
    var subs
    while (i--) {
        subs = this.deps[i].subs
        var j = subs.indexOf(this)
        if (j > -1) subs.splice(j, 1)
    }
}

module.exports = Binding
});
require.register("yyx990803-vue/src/observer.js", function(exports, require, module){
/* jshint proto:true */

var Emitter  = require('./emitter'),
    utils    = require('./utils'),
    // cache methods
    def      = utils.defProtected,
    isObject = utils.isObject,
    isArray  = Array.isArray,
    hasOwn   = ({}).hasOwnProperty,
    oDef     = Object.defineProperty,
    slice    = [].slice,
    // fix for IE + __proto__ problem
    // define methods as inenumerable if __proto__ is present,
    // otherwise enumerable so we can loop through and manually
    // attach to array instances
    hasProto = ({}).__proto__

// Array Mutation Handlers & Augmentations ------------------------------------

// The proxy prototype to replace the __proto__ of
// an observed array
var ArrayProxy = Object.create(Array.prototype)

// intercept mutation methods
;[
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
].forEach(watchMutation)

// Augment the ArrayProxy with convenience methods
def(ArrayProxy, '$set', function (index, data) {
    return this.splice(index, 1, data)[0]
}, !hasProto)

def(ArrayProxy, '$remove', function (index) {
    if (typeof index !== 'number') {
        index = this.indexOf(index)
    }
    if (index > -1) {
        return this.splice(index, 1)[0]
    }
}, !hasProto)

/**
 *  Intercep a mutation event so we can emit the mutation info.
 *  we also analyze what elements are added/removed and link/unlink
 *  them with the parent Array.
 */
function watchMutation (method) {
    def(ArrayProxy, method, function () {

        var args = slice.call(arguments),
            result = Array.prototype[method].apply(this, args),
            inserted, removed

        // determine new / removed elements
        if (method === 'push' || method === 'unshift') {
            inserted = args
        } else if (method === 'pop' || method === 'shift') {
            removed = [result]
        } else if (method === 'splice') {
            inserted = args.slice(2)
            removed = result
        }
        
        // link & unlink
        linkArrayElements(this, inserted)
        unlinkArrayElements(this, removed)

        // emit the mutation event
        this.__emitter__.emit('mutate', '', this, {
            method   : method,
            args     : args,
            result   : result,
            inserted : inserted,
            removed  : removed
        })

        return result
        
    }, !hasProto)
}

/**
 *  Link new elements to an Array, so when they change
 *  and emit events, the owner Array can be notified.
 */
function linkArrayElements (arr, items) {
    if (items) {
        var i = items.length, item, owners
        while (i--) {
            item = items[i]
            if (isWatchable(item)) {
                // if object is not converted for observing
                // convert it...
                if (!item.__emitter__) {
                    convert(item)
                    watch(item)
                }
                owners = item.__emitter__.owners
                if (owners.indexOf(arr) < 0) {
                    owners.push(arr)
                }
            }
        }
    }
}

/**
 *  Unlink removed elements from the ex-owner Array.
 */
function unlinkArrayElements (arr, items) {
    if (items) {
        var i = items.length, item
        while (i--) {
            item = items[i]
            if (item && item.__emitter__) {
                var owners = item.__emitter__.owners
                if (owners) owners.splice(owners.indexOf(arr))
            }
        }
    }
}

// Object add/delete key augmentation -----------------------------------------

var ObjProxy = Object.create(Object.prototype)

def(ObjProxy, '$add', function (key, val) {
    if (hasOwn.call(this, key)) return
    this[key] = val
    convertKey(this, key, true)
}, !hasProto)

def(ObjProxy, '$delete', function (key) {
    if (!(hasOwn.call(this, key))) return
    // trigger set events
    this[key] = undefined
    delete this[key]
    this.__emitter__.emit('delete', key)
}, !hasProto)

// Watch Helpers --------------------------------------------------------------

/**
 *  Check if a value is watchable
 */
function isWatchable (obj) {
    return typeof obj === 'object' && obj && !obj.$compiler
}

/**
 *  Convert an Object/Array to give it a change emitter.
 */
function convert (obj) {
    if (obj.__emitter__) return true
    var emitter = new Emitter()
    def(obj, '__emitter__', emitter)
    emitter
        .on('set', function (key, val, propagate) {
            if (propagate) propagateChange(obj)
        })
        .on('mutate', function () {
            propagateChange(obj)
        })
    emitter.values = utils.hash()
    emitter.owners = []
    return false
}

/**
 *  Propagate an array element's change to its owner arrays
 */
function propagateChange (obj) {
    var owners = obj.__emitter__.owners,
        i = owners.length
    while (i--) {
        owners[i].__emitter__.emit('set', '', '', true)
    }
}

/**
 *  Watch target based on its type
 */
function watch (obj) {
    if (isArray(obj)) {
        watchArray(obj)
    } else {
        watchObject(obj)
    }
}

/**
 *  Augment target objects with modified
 *  methods
 */
function augment (target, src) {
    if (hasProto) {
        target.__proto__ = src
    } else {
        for (var key in src) {
            def(target, key, src[key])
        }
    }
}

/**
 *  Watch an Object, recursive.
 */
function watchObject (obj) {
    augment(obj, ObjProxy)
    for (var key in obj) {
        convertKey(obj, key)
    }
}

/**
 *  Watch an Array, overload mutation methods
 *  and add augmentations by intercepting the prototype chain
 */
function watchArray (arr) {
    augment(arr, ArrayProxy)
    linkArrayElements(arr, arr)
}

/**
 *  Define accessors for a property on an Object
 *  so it emits get/set events.
 *  Then watch the value itself.
 */
function convertKey (obj, key, propagate) {
    var keyPrefix = key.charAt(0)
    if (keyPrefix === '$' || keyPrefix === '_') {
        return
    }
    // emit set on bind
    // this means when an object is observed it will emit
    // a first batch of set events.
    var emitter = obj.__emitter__,
        values  = emitter.values

    init(obj[key], propagate)

    oDef(obj, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            var value = values[key]
            // only emit get on tip values
            if (pub.shouldGet) {
                emitter.emit('get', key)
            }
            return value
        },
        set: function (newVal) {
            var oldVal = values[key]
            unobserve(oldVal, key, emitter)
            copyPaths(newVal, oldVal)
            // an immediate property should notify its parent
            // to emit set for itself too
            init(newVal, true)
        }
    })

    function init (val, propagate) {
        values[key] = val
        emitter.emit('set', key, val, propagate)
        if (isArray(val)) {
            emitter.emit('set', key + '.length', val.length, propagate)
        }
        observe(val, key, emitter)
    }
}

/**
 *  When a value that is already converted is
 *  observed again by another observer, we can skip
 *  the watch conversion and simply emit set event for
 *  all of its properties.
 */
function emitSet (obj) {
    var emitter = obj && obj.__emitter__
    if (!emitter) return
    if (isArray(obj)) {
        emitter.emit('set', 'length', obj.length)
    } else {
        var key, val
        for (key in obj) {
            val = obj[key]
            emitter.emit('set', key, val)
            emitSet(val)
        }
    }
}

/**
 *  Make sure all the paths in an old object exists
 *  in a new object.
 *  So when an object changes, all missing keys will
 *  emit a set event with undefined value.
 */
function copyPaths (newObj, oldObj) {
    if (!isObject(newObj) || !isObject(oldObj)) {
        return
    }
    var path, oldVal, newVal
    for (path in oldObj) {
        if (!(hasOwn.call(newObj, path))) {
            oldVal = oldObj[path]
            if (isArray(oldVal)) {
                newObj[path] = []
            } else if (isObject(oldVal)) {
                newVal = newObj[path] = {}
                copyPaths(newVal, oldVal)
            } else {
                newObj[path] = undefined
            }
        }
    }
}

/**
 *  walk along a path and make sure it can be accessed
 *  and enumerated in that object
 */
function ensurePath (obj, key) {
    var path = key.split('.'), sec
    for (var i = 0, d = path.length - 1; i < d; i++) {
        sec = path[i]
        if (!obj[sec]) {
            obj[sec] = {}
            if (obj.__emitter__) convertKey(obj, sec)
        }
        obj = obj[sec]
    }
    if (isObject(obj)) {
        sec = path[i]
        if (!(hasOwn.call(obj, sec))) {
            obj[sec] = undefined
            if (obj.__emitter__) convertKey(obj, sec)
        }
    }
}

// Main API Methods -----------------------------------------------------------

/**
 *  Observe an object with a given path,
 *  and proxy get/set/mutate events to the provided observer.
 */
function observe (obj, rawPath, observer) {

    if (!isWatchable(obj)) return

    var path = rawPath ? rawPath + '.' : '',
        alreadyConverted = convert(obj),
        emitter = obj.__emitter__

    // setup proxy listeners on the parent observer.
    // we need to keep reference to them so that they
    // can be removed when the object is un-observed.
    observer.proxies = observer.proxies || {}
    var proxies = observer.proxies[path] = {
        get: function (key) {
            observer.emit('get', path + key)
        },
        set: function (key, val, propagate) {
            if (key) observer.emit('set', path + key, val)
            // also notify observer that the object itself changed
            // but only do so when it's a immediate property. this
            // avoids duplicate event firing.
            if (rawPath && propagate) {
                observer.emit('set', rawPath, obj, true)
            }
        },
        mutate: function (key, val, mutation) {
            // if the Array is a root value
            // the key will be null
            var fixedPath = key ? path + key : rawPath
            observer.emit('mutate', fixedPath, val, mutation)
            // also emit set for Array's length when it mutates
            var m = mutation.method
            if (m !== 'sort' && m !== 'reverse') {
                observer.emit('set', fixedPath + '.length', val.length)
            }
        }
    }

    // attach the listeners to the child observer.
    // now all the events will propagate upwards.
    emitter
        .on('get', proxies.get)
        .on('set', proxies.set)
        .on('mutate', proxies.mutate)

    if (alreadyConverted) {
        // for objects that have already been converted,
        // emit set events for everything inside
        emitSet(obj)
    } else {
        watch(obj)
    }
}

/**
 *  Cancel observation, turn off the listeners.
 */
function unobserve (obj, path, observer) {

    if (!obj || !obj.__emitter__) return

    path = path ? path + '.' : ''
    var proxies = observer.proxies[path]
    if (!proxies) return

    // turn off listeners
    obj.__emitter__
        .off('get', proxies.get)
        .off('set', proxies.set)
        .off('mutate', proxies.mutate)

    // remove reference
    observer.proxies[path] = null
}

// Expose API -----------------------------------------------------------------

var pub = module.exports = {

    // whether to emit get events
    // only enabled during dependency parsing
    shouldGet   : false,

    observe     : observe,
    unobserve   : unobserve,
    ensurePath  : ensurePath,
    copyPaths   : copyPaths,
    watch       : watch,
    convert     : convert,
    convertKey  : convertKey
}
});
require.register("yyx990803-vue/src/directive.js", function(exports, require, module){
var dirId           = 1,
    ARG_RE          = /^[\w\$-]+$/,
    FILTER_TOKEN_RE = /[^\s'"]+|'[^']+'|"[^"]+"/g,
    NESTING_RE      = /^\$(parent|root)\./,
    SINGLE_VAR_RE   = /^[\w\.$]+$/,
    QUOTE_RE        = /"/g,
    TextParser      = require('./text-parser')

/**
 *  Directive class
 *  represents a single directive instance in the DOM
 */
function Directive (name, ast, definition, compiler, el) {

    this.id             = dirId++
    this.name           = name
    this.compiler       = compiler
    this.vm             = compiler.vm
    this.el             = el
    this.computeFilters = false
    this.key            = ast.key
    this.arg            = ast.arg
    this.expression     = ast.expression

    var isEmpty = this.expression === ''

    // mix in properties from the directive definition
    if (typeof definition === 'function') {
        this[isEmpty ? 'bind' : 'update'] = definition
    } else {
        for (var prop in definition) {
            this[prop] = definition[prop]
        }
    }

    // empty expression, we're done.
    if (isEmpty || this.isEmpty) {
        this.isEmpty = true
        return
    }

    if (TextParser.Regex.test(this.key)) {
        this.key = compiler.eval(this.key)
        if (this.isLiteral) {
            this.expression = this.key
        }
    }

    var filters = ast.filters,
        filter, fn, i, l, computed
    if (filters) {
        this.filters = []
        for (i = 0, l = filters.length; i < l; i++) {
            filter = filters[i]
            fn = this.compiler.getOption('filters', filter.name)
            if (fn) {
                filter.apply = fn
                this.filters.push(filter)
                if (fn.computed) {
                    computed = true
                }
            }
        }
    }

    if (!this.filters || !this.filters.length) {
        this.filters = null
    }

    if (computed) {
        this.computedKey = Directive.inlineFilters(this.key, this.filters)
        this.filters = null
    }

    this.isExp =
        computed ||
        !SINGLE_VAR_RE.test(this.key) ||
        NESTING_RE.test(this.key)

}

var DirProto = Directive.prototype

/**
 *  called when a new value is set 
 *  for computed properties, this will only be called once
 *  during initialization.
 */
DirProto.$update = function (value, init) {
    if (this.$lock) return
    if (init || value !== this.value || (value && typeof value === 'object')) {
        this.value = value
        if (this.update) {
            this.update(
                this.filters && !this.computeFilters
                    ? this.$applyFilters(value)
                    : value,
                init
            )
        }
    }
}

/**
 *  pipe the value through filters
 */
DirProto.$applyFilters = function (value) {
    var filtered = value, filter
    for (var i = 0, l = this.filters.length; i < l; i++) {
        filter = this.filters[i]
        filtered = filter.apply.apply(this.vm, [filtered].concat(filter.args))
    }
    return filtered
}

/**
 *  Unbind diretive
 */
DirProto.$unbind = function () {
    // this can be called before the el is even assigned...
    if (!this.el || !this.vm) return
    if (this.unbind) this.unbind()
    this.vm = this.el = this.binding = this.compiler = null
}

// Exposed static methods -----------------------------------------------------

/**
 *  Parse a directive string into an Array of
 *  AST-like objects representing directives
 */
Directive.parse = function (str) {

    var inSingle = false,
        inDouble = false,
        curly    = 0,
        square   = 0,
        paren    = 0,
        begin    = 0,
        argIndex = 0,
        dirs     = [],
        dir      = {},
        lastFilterIndex = 0,
        arg

    for (var c, i = 0, l = str.length; i < l; i++) {
        c = str.charAt(i)
        if (inSingle) {
            // check single quote
            if (c === "'") inSingle = !inSingle
        } else if (inDouble) {
            // check double quote
            if (c === '"') inDouble = !inDouble
        } else if (c === ',' && !paren && !curly && !square) {
            // reached the end of a directive
            pushDir()
            // reset & skip the comma
            dir = {}
            begin = argIndex = lastFilterIndex = i + 1
        } else if (c === ':' && !dir.key && !dir.arg) {
            // argument
            arg = str.slice(begin, i).trim()
            if (ARG_RE.test(arg)) {
                argIndex = i + 1
                dir.arg = arg
            }
        } else if (c === '|' && str.charAt(i + 1) !== '|' && str.charAt(i - 1) !== '|') {
            if (dir.key === undefined) {
                // first filter, end of key
                lastFilterIndex = i + 1
                dir.key = str.slice(argIndex, i).trim()
            } else {
                // already has filter
                pushFilter()
            }
        } else if (c === '"') {
            inDouble = true
        } else if (c === "'") {
            inSingle = true
        } else if (c === '(') {
            paren++
        } else if (c === ')') {
            paren--
        } else if (c === '[') {
            square++
        } else if (c === ']') {
            square--
        } else if (c === '{') {
            curly++
        } else if (c === '}') {
            curly--
        }
    }
    if (i === 0 || begin !== i) {
        pushDir()
    }

    function pushDir () {
        dir.expression = str.slice(begin, i).trim()
        if (dir.key === undefined) {
            dir.key = str.slice(argIndex, i).trim()
        } else if (lastFilterIndex !== begin) {
            pushFilter()
        }
        if (i === 0 || dir.key) {
            dirs.push(dir)
        }
    }

    function pushFilter () {
        var exp = str.slice(lastFilterIndex, i).trim(),
            filter
        if (exp) {
            filter = {}
            var tokens = exp.match(FILTER_TOKEN_RE)
            filter.name = tokens[0]
            filter.args = tokens.length > 1 ? tokens.slice(1) : null
        }
        if (filter) {
            (dir.filters = dir.filters || []).push(filter)
        }
        lastFilterIndex = i + 1
    }

    return dirs
}

/**
 *  Inline computed filters so they become part
 *  of the expression
 */
Directive.inlineFilters = function (key, filters) {
    var args, filter
    for (var i = 0, l = filters.length; i < l; i++) {
        filter = filters[i]
        args = filter.args
            ? ',"' + filter.args.map(escapeQuote).join('","') + '"'
            : ''
        key = 'this.$compiler.getOption("filters", "' +
                filter.name +
            '").call(this,' +
                key + args +
            ')'
    }
    return key
}

/**
 *  Convert double quotes to single quotes
 *  so they don't mess up the generated function body
 */
function escapeQuote (v) {
    return v.indexOf('"') > -1
        ? v.replace(QUOTE_RE, '\'')
        : v
}

module.exports = Directive
});
require.register("yyx990803-vue/src/exp-parser.js", function(exports, require, module){
var utils           = require('./utils'),
    STR_SAVE_RE     = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g,
    STR_RESTORE_RE  = /"(\d+)"/g,
    NEWLINE_RE      = /\n/g,
    CTOR_RE         = new RegExp('constructor'.split('').join('[\'"+, ]*')),
    UNICODE_RE      = /\\u\d\d\d\d/

// Variable extraction scooped from https://github.com/RubyLouvre/avalon

var KEYWORDS =
        // keywords
        'break,case,catch,continue,debugger,default,delete,do,else,false' +
        ',finally,for,function,if,in,instanceof,new,null,return,switch,this' +
        ',throw,true,try,typeof,var,void,while,with,undefined' +
        // reserved
        ',abstract,boolean,byte,char,class,const,double,enum,export,extends' +
        ',final,float,goto,implements,import,int,interface,long,native' +
        ',package,private,protected,public,short,static,super,synchronized' +
        ',throws,transient,volatile' +
        // ECMA 5 - use strict
        ',arguments,let,yield' +
        // allow using Math in expressions
        ',Math',
        
    KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g'),
    REMOVE_RE   = /\/\*(?:.|\n)*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|'[^']*'|"[^"]*"|[\s\t\n]*\.[\s\t\n]*[$\w\.]+|[\{,]\s*[\w\$_]+\s*:/g,
    SPLIT_RE    = /[^\w$]+/g,
    NUMBER_RE   = /\b\d[^,]*/g,
    BOUNDARY_RE = /^,+|,+$/g

/**
 *  Strip top level variable names from a snippet of JS expression
 */
function getVariables (code) {
    code = code
        .replace(REMOVE_RE, '')
        .replace(SPLIT_RE, ',')
        .replace(KEYWORDS_RE, '')
        .replace(NUMBER_RE, '')
        .replace(BOUNDARY_RE, '')
    return code
        ? code.split(/,+/)
        : []
}

/**
 *  A given path could potentially exist not on the
 *  current compiler, but up in the parent chain somewhere.
 *  This function generates an access relationship string
 *  that can be used in the getter function by walking up
 *  the parent chain to check for key existence.
 *
 *  It stops at top parent if no vm in the chain has the
 *  key. It then creates any missing bindings on the
 *  final resolved vm.
 */
function traceScope (path, compiler, data) {
    var rel  = '',
        dist = 0,
        self = compiler

    if (data && utils.get(data, path) !== undefined) {
        // hack: temporarily attached data
        return '$temp.'
    }

    while (compiler) {
        if (compiler.hasKey(path)) {
            break
        } else {
            compiler = compiler.parent
            dist++
        }
    }
    if (compiler) {
        while (dist--) {
            rel += '$parent.'
        }
        if (!compiler.bindings[path] && path.charAt(0) !== '$') {
            compiler.createBinding(path)
        }
    } else {
        self.createBinding(path)
    }
    return rel
}

/**
 *  Create a function from a string...
 *  this looks like evil magic but since all variables are limited
 *  to the VM's data it's actually properly sandboxed
 */
function makeGetter (exp, raw) {
    var fn
    try {
        fn = new Function(exp)
    } catch (e) {
        utils.warn('Error parsing expression: ' + raw)
    }
    return fn
}

/**
 *  Escape a leading dollar sign for regex construction
 */
function escapeDollar (v) {
    return v.charAt(0) === '$'
        ? '\\' + v
        : v
}

/**
 *  Parse and return an anonymous computed property getter function
 *  from an arbitrary expression, together with a list of paths to be
 *  created as bindings.
 */
exports.parse = function (exp, compiler, data) {
    // unicode and 'constructor' are not allowed for XSS security.
    if (UNICODE_RE.test(exp) || CTOR_RE.test(exp)) {
        utils.warn('Unsafe expression: ' + exp)
        return
    }
    // extract variable names
    var vars = getVariables(exp)
    if (!vars.length) {
        return makeGetter('return ' + exp, exp)
    }
    vars = utils.unique(vars)

    var accessors = '',
        has       = utils.hash(),
        strings   = [],
        // construct a regex to extract all valid variable paths
        // ones that begin with "$" are particularly tricky
        // because we can't use \b for them
        pathRE = new RegExp(
            "[^$\\w\\.](" +
            vars.map(escapeDollar).join('|') +
            ")[$\\w\\.]*\\b", 'g'
        ),
        body = (' ' + exp)
            .replace(STR_SAVE_RE, saveStrings)
            .replace(pathRE, replacePath)
            .replace(STR_RESTORE_RE, restoreStrings)

    body = accessors + 'return ' + body

    function saveStrings (str) {
        var i = strings.length
        // escape newlines in strings so the expression
        // can be correctly evaluated
        strings[i] = str.replace(NEWLINE_RE, '\\n')
        return '"' + i + '"'
    }

    function replacePath (path) {
        // keep track of the first char
        var c = path.charAt(0)
        path = path.slice(1)
        var val = 'this.' + traceScope(path, compiler, data) + path
        if (!has[path]) {
            accessors += val + ';'
            has[path] = 1
        }
        // don't forget to put that first char back
        return c + val
    }

    function restoreStrings (str, i) {
        return strings[i]
    }

    return makeGetter(body, exp)
}

/**
 *  Evaluate an expression in the context of a compiler.
 *  Accepts additional data.
 */
exports.eval = function (exp, compiler, data) {
    var getter = exports.parse(exp, compiler, data), res
    if (getter) {
        // hack: temporarily attach the additional data so
        // it can be accessed in the getter
        compiler.vm.$temp = data
        res = getter.call(compiler.vm)
        delete compiler.vm.$temp
    }
    return res
}
});
require.register("yyx990803-vue/src/template-parser.js", function(exports, require, module){
var toFragment = require('./fragment');

/**
 * Parses a template string or node and normalizes it into a
 * a node that can be used as a partial of a template option
 *
 * Possible values include
 * id selector: '#some-template-id'
 * template string: '<div><span>my template</span></div>'
 * DocumentFragment object
 * Node object of type Template
 */
module.exports = function(template) {
    var templateNode;

    if (template instanceof window.DocumentFragment) {
        // if the template is already a document fragment -- do nothing
        return template
    }

    if (typeof template === 'string') {
        // template by ID
        if (template.charAt(0) === '#') {
            templateNode = document.getElementById(template.slice(1))
            if (!templateNode) return
        } else {
            return toFragment(template)
        }
    } else if (template.nodeType) {
        templateNode = template
    } else {
        return
    }

    // if its a template tag and the browser supports it,
    // its content is already a document fragment!
    if (templateNode.tagName === 'TEMPLATE' && templateNode.content) {
        return templateNode.content
    }

    if (templateNode.tagName === 'SCRIPT') {
        return toFragment(templateNode.innerHTML)
    }

    return toFragment(templateNode.outerHTML);
}

});
require.register("yyx990803-vue/src/text-parser.js", function(exports, require, module){
var openChar        = '{',
    endChar         = '}',
    ESCAPE_RE       = /[-.*+?^${}()|[\]\/\\]/g,
    // lazy require
    Directive

exports.Regex = buildInterpolationRegex()

function buildInterpolationRegex () {
    var open = escapeRegex(openChar),
        end  = escapeRegex(endChar)
    return new RegExp(open + open + open + '?(.+?)' + end + '?' + end + end)
}

function escapeRegex (str) {
    return str.replace(ESCAPE_RE, '\\$&')
}

function setDelimiters (delimiters) {
    openChar = delimiters[0]
    endChar = delimiters[1]
    exports.delimiters = delimiters
    exports.Regex = buildInterpolationRegex()
}

/** 
 *  Parse a piece of text, return an array of tokens
 *  token types:
 *  1. plain string
 *  2. object with key = binding key
 *  3. object with key & html = true
 */
function parse (text) {
    if (!exports.Regex.test(text)) return null
    var m, i, token, match, tokens = []
    /* jshint boss: true */
    while (m = text.match(exports.Regex)) {
        i = m.index
        if (i > 0) tokens.push(text.slice(0, i))
        token = { key: m[1].trim() }
        match = m[0]
        token.html =
            match.charAt(2) === openChar &&
            match.charAt(match.length - 3) === endChar
        tokens.push(token)
        text = text.slice(i + m[0].length)
    }
    if (text.length) tokens.push(text)
    return tokens
}

/**
 *  Parse an attribute value with possible interpolation tags
 *  return a Directive-friendly expression
 *
 *  e.g.  a {{b}} c  =>  "a " + b + " c"
 */
function parseAttr (attr) {
    Directive = Directive || require('./directive')
    var tokens = parse(attr)
    if (!tokens) return null
    if (tokens.length === 1) return tokens[0].key
    var res = [], token
    for (var i = 0, l = tokens.length; i < l; i++) {
        token = tokens[i]
        res.push(
            token.key
                ? inlineFilters(token.key)
                : ('"' + token + '"')
        )
    }
    return res.join('+')
}

/**
 *  Inlines any possible filters in a binding
 *  so that we can combine everything into a huge expression
 */
function inlineFilters (key) {
    if (key.indexOf('|') > -1) {
        var dirs = Directive.parse(key),
            dir = dirs && dirs[0]
        if (dir && dir.filters) {
            key = Directive.inlineFilters(
                dir.key,
                dir.filters
            )
        }
    }
    return '(' + key + ')'
}

exports.parse         = parse
exports.parseAttr     = parseAttr
exports.setDelimiters = setDelimiters
exports.delimiters    = [openChar, endChar]
});
require.register("yyx990803-vue/src/deps-parser.js", function(exports, require, module){
var Emitter  = require('./emitter'),
    utils    = require('./utils'),
    Observer = require('./observer'),
    catcher  = new Emitter()

/**
 *  Auto-extract the dependencies of a computed property
 *  by recording the getters triggered when evaluating it.
 */
function catchDeps (binding) {
    if (binding.isFn) return
    utils.log('\n- ' + binding.key)
    var got = utils.hash()
    binding.deps = []
    catcher.on('get', function (dep) {
        var has = got[dep.key]
        if (
            // avoid duplicate bindings
            (has && has.compiler === dep.compiler) ||
            // avoid repeated items as dependency
            // only when the binding is from self or the parent chain
            (dep.compiler.repeat && !isParentOf(dep.compiler, binding.compiler))
        ) {
            return
        }
        got[dep.key] = dep
        utils.log('  - ' + dep.key)
        binding.deps.push(dep)
        dep.subs.push(binding)
    })
    binding.value.$get()
    catcher.off('get')
}

/**
 *  Test if A is a parent of or equals B
 */
function isParentOf (a, b) {
    while (b) {
        if (a === b) {
            return true
        }
        b = b.parent
    }
}

module.exports = {

    /**
     *  the observer that catches events triggered by getters
     */
    catcher: catcher,

    /**
     *  parse a list of computed property bindings
     */
    parse: function (bindings) {
        utils.log('\nparsing dependencies...')
        Observer.shouldGet = true
        bindings.forEach(catchDeps)
        Observer.shouldGet = false
        utils.log('\ndone.')
    }
    
}
});
require.register("yyx990803-vue/src/filters.js", function(exports, require, module){
var utils    = require('./utils'),
    get      = utils.get,
    slice    = [].slice,
    QUOTE_RE = /^'.*'$/,
    filters  = module.exports = utils.hash()

/**
 *  'abc' => 'Abc'
 */
filters.capitalize = function (value) {
    if (!value && value !== 0) return ''
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 *  'abc' => 'ABC'
 */
filters.uppercase = function (value) {
    return (value || value === 0)
        ? value.toString().toUpperCase()
        : ''
}

/**
 *  'AbC' => 'abc'
 */
filters.lowercase = function (value) {
    return (value || value === 0)
        ? value.toString().toLowerCase()
        : ''
}

/**
 *  12345 => $12,345.00
 */
filters.currency = function (value, sign) {
    value = parseFloat(value)
    if (!value && value !== 0) return ''
    sign = sign || '$'
    var s = Math.floor(value).toString(),
        i = s.length % 3,
        h = i > 0 ? (s.slice(0, i) + (s.length > 3 ? ',' : '')) : '',
        f = '.' + value.toFixed(2).slice(-2)
    return sign + h + s.slice(i).replace(/(\d{3})(?=\d)/g, '$1,') + f
}

/**
 *  args: an array of strings corresponding to
 *  the single, double, triple ... forms of the word to
 *  be pluralized. When the number to be pluralized
 *  exceeds the length of the args, it will use the last
 *  entry in the array.
 *
 *  e.g. ['single', 'double', 'triple', 'multiple']
 */
filters.pluralize = function (value) {
    var args = slice.call(arguments, 1)
    return args.length > 1
        ? (args[value - 1] || args[args.length - 1])
        : (args[value - 1] || args[0] + 's')
}

/**
 *  A special filter that takes a handler function,
 *  wraps it so it only gets triggered on specific keypresses.
 *
 *  v-on only
 */

var keyCodes = {
    enter    : 13,
    tab      : 9,
    'delete' : 46,
    up       : 38,
    left     : 37,
    right    : 39,
    down     : 40,
    esc      : 27
}

filters.key = function (handler, key) {
    if (!handler) return
    var code = keyCodes[key]
    if (!code) {
        code = parseInt(key, 10)
    }
    return function (e) {
        if (e.keyCode === code) {
            return handler.call(this, e)
        }
    }
}

/**
 *  Filter filter for v-repeat
 */
filters.filterBy = function (arr, searchKey, delimiter, dataKey) {

    // allow optional `in` delimiter
    // because why not
    if (delimiter && delimiter !== 'in') {
        dataKey = delimiter
    }

    // get the search string
    var search = stripQuotes(searchKey) || this.$get(searchKey)
    if (!search) return arr
    search = search.toLowerCase()

    // get the optional dataKey
    dataKey = dataKey && (stripQuotes(dataKey) || this.$get(dataKey))

    // convert object to array
    if (!Array.isArray(arr)) {
        arr = utils.objectToArray(arr)
    }

    return arr.filter(function (item) {
        return dataKey
            ? contains(get(item, dataKey), search)
            : contains(item, search)
    })

}

filters.filterBy.computed = true

/**
 *  Sort fitler for v-repeat
 */
filters.orderBy = function (arr, sortKey, reverseKey) {

    var key = stripQuotes(sortKey) || this.$get(sortKey)
    if (!key) return arr

    // convert object to array
    if (!Array.isArray(arr)) {
        arr = utils.objectToArray(arr)
    }

    var order = 1
    if (reverseKey) {
        if (reverseKey === '-1') {
            order = -1
        } else if (reverseKey.charAt(0) === '!') {
            reverseKey = reverseKey.slice(1)
            order = this.$get(reverseKey) ? 1 : -1
        } else {
            order = this.$get(reverseKey) ? -1 : 1
        }
    }

    // sort on a copy to avoid mutating original array
    return arr.slice().sort(function (a, b) {
        a = get(a, key)
        b = get(b, key)
        return a === b ? 0 : a > b ? order : -order
    })

}

filters.orderBy.computed = true

// Array filter helpers -------------------------------------------------------

/**
 *  String contain helper
 */
function contains (val, search) {
    /* jshint eqeqeq: false */
    if (utils.isObject(val)) {
        for (var key in val) {
            if (contains(val[key], search)) {
                return true
            }
        }
    } else if (val != null) {
        return val.toString().toLowerCase().indexOf(search) > -1
    }
}

/**
 *  Test whether a string is in quotes,
 *  if yes return stripped string
 */
function stripQuotes (str) {
    if (QUOTE_RE.test(str)) {
        return str.slice(1, -1)
    }
}
});
require.register("yyx990803-vue/src/transition.js", function(exports, require, module){
var endEvents  = sniffEndEvents(),
    config     = require('./config'),
    // batch enter animations so we only force the layout once
    Batcher    = require('./batcher'),
    batcher    = new Batcher(),
    // cache timer functions
    setTO      = window.setTimeout,
    clearTO    = window.clearTimeout,
    // exit codes for testing
    codes = {
        CSS_E     : 1,
        CSS_L     : 2,
        JS_E      : 3,
        JS_L      : 4,
        CSS_SKIP  : -1,
        JS_SKIP   : -2,
        JS_SKIP_E : -3,
        JS_SKIP_L : -4,
        INIT      : -5,
        SKIP      : -6
    }

// force layout before triggering transitions/animations
batcher._preFlush = function () {
    /* jshint unused: false */
    var f = document.body.offsetHeight
}

/**
 *  stage:
 *    1 = enter
 *    2 = leave
 */
var transition = module.exports = function (el, stage, cb, compiler) {

    var changeState = function () {
        cb()
        compiler.execHook(stage > 0 ? 'attached' : 'detached')
    }

    if (compiler.init) {
        changeState()
        return codes.INIT
    }

    var hasTransition = el.vue_trans === '',
        hasAnimation  = el.vue_anim === '',
        effectId      = el.vue_effect

    if (effectId) {
        return applyTransitionFunctions(
            el,
            stage,
            changeState,
            effectId,
            compiler
        )
    } else if (hasTransition || hasAnimation) {
        return applyTransitionClass(
            el,
            stage,
            changeState,
            hasAnimation
        )
    } else {
        changeState()
        return codes.SKIP
    }

}

/**
 *  Togggle a CSS class to trigger transition
 */
function applyTransitionClass (el, stage, changeState, hasAnimation) {

    if (!endEvents.trans) {
        changeState()
        return codes.CSS_SKIP
    }

    // if the browser supports transition,
    // it must have classList...
    var onEnd,
        classList        = el.classList,
        existingCallback = el.vue_trans_cb,
        enterClass       = config.enterClass,
        leaveClass       = config.leaveClass,
        endEvent         = hasAnimation ? endEvents.anim : endEvents.trans

    // cancel unfinished callbacks and jobs
    if (existingCallback) {
        el.removeEventListener(endEvent, existingCallback)
        classList.remove(enterClass)
        classList.remove(leaveClass)
        el.vue_trans_cb = null
    }

    if (stage > 0) { // enter

        // set to enter state before appending
        classList.add(enterClass)
        // append
        changeState()
        // trigger transition
        if (!hasAnimation) {
            batcher.push({
                execute: function () {
                    classList.remove(enterClass)
                }
            })
        } else {
            onEnd = function (e) {
                if (e.target === el) {
                    el.removeEventListener(endEvent, onEnd)
                    el.vue_trans_cb = null
                    classList.remove(enterClass)
                }
            }
            el.addEventListener(endEvent, onEnd)
            el.vue_trans_cb = onEnd
        }
        return codes.CSS_E

    } else { // leave

        if (el.offsetWidth || el.offsetHeight) {
            // trigger hide transition
            classList.add(leaveClass)
            onEnd = function (e) {
                if (e.target === el) {
                    el.removeEventListener(endEvent, onEnd)
                    el.vue_trans_cb = null
                    // actually remove node here
                    changeState()
                    classList.remove(leaveClass)
                }
            }
            // attach transition end listener
            el.addEventListener(endEvent, onEnd)
            el.vue_trans_cb = onEnd
        } else {
            // directly remove invisible elements
            changeState()
        }
        return codes.CSS_L
        
    }

}

function applyTransitionFunctions (el, stage, changeState, effectId, compiler) {

    var funcs = compiler.getOption('effects', effectId)
    if (!funcs) {
        changeState()
        return codes.JS_SKIP
    }

    var enter = funcs.enter,
        leave = funcs.leave,
        timeouts = el.vue_timeouts

    // clear previous timeouts
    if (timeouts) {
        var i = timeouts.length
        while (i--) {
            clearTO(timeouts[i])
        }
    }

    timeouts = el.vue_timeouts = []
    function timeout (cb, delay) {
        var id = setTO(function () {
            cb()
            timeouts.splice(timeouts.indexOf(id), 1)
            if (!timeouts.length) {
                el.vue_timeouts = null
            }
        }, delay)
        timeouts.push(id)
    }

    if (stage > 0) { // enter
        if (typeof enter !== 'function') {
            changeState()
            return codes.JS_SKIP_E
        }
        enter(el, changeState, timeout)
        return codes.JS_E
    } else { // leave
        if (typeof leave !== 'function') {
            changeState()
            return codes.JS_SKIP_L
        }
        leave(el, changeState, timeout)
        return codes.JS_L
    }

}

/**
 *  Sniff proper transition end event name
 */
function sniffEndEvents () {
    var el = document.createElement('vue'),
        defaultEvent = 'transitionend',
        events = {
            'webkitTransition' : 'webkitTransitionEnd',
            'transition'       : defaultEvent,
            'mozTransition'    : defaultEvent
        },
        ret = {}
    for (var name in events) {
        if (el.style[name] !== undefined) {
            ret.trans = events[name]
            break
        }
    }
    ret.anim = el.style.animation === ''
        ? 'animationend'
        : 'webkitAnimationEnd'
    return ret
}

// Expose some stuff for testing purposes
transition.codes = codes
transition.sniff = sniffEndEvents
});
require.register("yyx990803-vue/src/batcher.js", function(exports, require, module){
var utils = require('./utils')

function Batcher () {
    this.reset()
}

var BatcherProto = Batcher.prototype

BatcherProto.push = function (job) {
    if (!job.id || !this.has[job.id]) {
        this.queue.push(job)
        this.has[job.id] = job
        if (!this.waiting) {
            this.waiting = true
            utils.nextTick(utils.bind(this.flush, this))
        }
    } else if (job.override) {
        var oldJob = this.has[job.id]
        oldJob.cancelled = true
        this.queue.push(job)
        this.has[job.id] = job
    }
}

BatcherProto.flush = function () {
    // before flush hook
    if (this._preFlush) this._preFlush()
    // do not cache length because more jobs might be pushed
    // as we execute existing jobs
    for (var i = 0; i < this.queue.length; i++) {
        var job = this.queue[i]
        if (!job.cancelled) {
            job.execute()
        }
    }
    this.reset()
}

BatcherProto.reset = function () {
    this.has = utils.hash()
    this.queue = []
    this.waiting = false
}

module.exports = Batcher
});
require.register("yyx990803-vue/src/directives/index.js", function(exports, require, module){
var utils      = require('../utils'),
    config     = require('../config'),
    transition = require('../transition'),
    directives = module.exports = utils.hash()

/**
 *  Nest and manage a Child VM
 */
directives.component = {
    isLiteral: true,
    bind: function () {
        if (!this.el.vue_vm) {
            this.childVM = new this.Ctor({
                el: this.el,
                parent: this.vm
            })
        }
    },
    unbind: function () {
        if (this.childVM) {
            this.childVM.$destroy()
        }
    }
}

/**
 *  Binding HTML attributes
 */
directives.attr = {
    bind: function () {
        var params = this.vm.$options.paramAttributes
        this.isParam = params && params.indexOf(this.arg) > -1
    },
    update: function (value) {
        if (value || value === 0) {
            this.el.setAttribute(this.arg, value)
        } else {
            this.el.removeAttribute(this.arg)
        }
        if (this.isParam) {
            this.vm[this.arg] = utils.checkNumber(value)
        }
    }
}

/**
 *  Binding textContent
 */
directives.text = {
    bind: function () {
        this.attr = this.el.nodeType === 3
            ? 'nodeValue'
            : 'textContent'
    },
    update: function (value) {
        this.el[this.attr] = utils.guard(value)
    }
}

/**
 *  Binding CSS display property
 */
directives.show = function (value) {
    var el = this.el,
        target = value ? '' : 'none',
        change = function () {
            el.style.display = target
        }
    transition(el, value ? 1 : -1, change, this.compiler)
}

/**
 *  Binding CSS classes
 */
directives['class'] = function (value) {
    if (this.arg) {
        utils[value ? 'addClass' : 'removeClass'](this.el, this.arg)
    } else {
        if (this.lastVal) {
            utils.removeClass(this.el, this.lastVal)
        }
        if (value) {
            utils.addClass(this.el, value)
            this.lastVal = value
        }
    }
}

/**
 *  Only removed after the owner VM is ready
 */
directives.cloak = {
    isEmpty: true,
    bind: function () {
        var el = this.el
        this.compiler.observer.once('hook:ready', function () {
            el.removeAttribute(config.prefix + '-cloak')
        })
    }
}

/**
 *  Store a reference to self in parent VM's $
 */
directives.ref = {
    isLiteral: true,
    bind: function () {
        var id = this.expression
        if (id) {
            this.vm.$parent.$[id] = this.vm
        }
    },
    unbind: function () {
        var id = this.expression
        if (id) {
            delete this.vm.$parent.$[id]
        }
    }
}

directives.on      = require('./on')
directives.repeat  = require('./repeat')
directives.model   = require('./model')
directives['if']   = require('./if')
directives['with'] = require('./with')
directives.html    = require('./html')
directives.style   = require('./style')
directives.partial = require('./partial')
directives.view    = require('./view')
});
require.register("yyx990803-vue/src/directives/if.js", function(exports, require, module){
var utils    = require('../utils')

/**
 *  Manages a conditional child VM
 */
module.exports = {

    bind: function () {
        
        this.parent = this.el.parentNode
        this.ref    = document.createComment('vue-if')
        this.Ctor   = this.compiler.resolveComponent(this.el)

        // insert ref
        this.parent.insertBefore(this.ref, this.el)
        this.parent.removeChild(this.el)

        if (utils.attr(this.el, 'view')) {
            utils.warn(
                'Conflict: v-if cannot be used together with v-view. ' +
                'Just set v-view\'s binding value to empty string to empty it.'
            )
        }
        if (utils.attr(this.el, 'repeat')) {
            utils.warn(
                'Conflict: v-if cannot be used together with v-repeat. ' +
                'Use `v-show` or the `filterBy` filter instead.'
            )
        }
    },

    update: function (value) {

        if (!value) {
            this.unbind()
        } else if (!this.childVM) {
            this.childVM = new this.Ctor({
                el: this.el.cloneNode(true),
                parent: this.vm
            })
            if (this.compiler.init) {
                this.parent.insertBefore(this.childVM.$el, this.ref)
            } else {
                this.childVM.$before(this.ref)
            }
        }
        
    },

    unbind: function () {
        if (this.childVM) {
            this.childVM.$destroy()
            this.childVM = null
        }
    }
}
});
require.register("yyx990803-vue/src/directives/repeat.js", function(exports, require, module){
var utils      = require('../utils'),
    config     = require('../config')

/**
 *  Binding that manages VMs based on an Array
 */
module.exports = {

    bind: function () {

        this.identifier = '$r' + this.id

        // a hash to cache the same expressions on repeated instances
        // so they don't have to be compiled for every single instance
        this.expCache = utils.hash()

        var el   = this.el,
            ctn  = this.container = el.parentNode

        // extract child Id, if any
        this.childId = this.compiler.eval(utils.attr(el, 'ref'))

        // create a comment node as a reference node for DOM insertions
        this.ref = document.createComment(config.prefix + '-repeat-' + this.key)
        ctn.insertBefore(this.ref, el)
        ctn.removeChild(el)

        this.collection = null
        this.vms = null

    },

    update: function (collection) {

        if (!Array.isArray(collection)) {
            if (utils.isObject(collection)) {
                collection = utils.objectToArray(collection)
            } else {
                utils.warn('v-repeat only accepts Array or Object values.')
            }
        }

        // keep reference of old data and VMs
        // so we can reuse them if possible
        this.oldVMs = this.vms
        this.oldCollection = this.collection
        collection = this.collection = collection || []

        var isObject = collection[0] && utils.isObject(collection[0])
        this.vms = this.oldCollection
            ? this.diff(collection, isObject)
            : this.init(collection, isObject)

        if (this.childId) {
            this.vm.$[this.childId] = this.vms
        }

    },

    init: function (collection, isObject) {
        var vm, vms = []
        for (var i = 0, l = collection.length; i < l; i++) {
            vm = this.build(collection[i], i, isObject)
            vms.push(vm)
            if (this.compiler.init) {
                this.container.insertBefore(vm.$el, this.ref)
            } else {
                vm.$before(this.ref)
            }
        }
        return vms
    },

    /**
     *  Diff the new array with the old
     *  and determine the minimum amount of DOM manipulations.
     */
    diff: function (newCollection, isObject) {

        var i, l, item, vm,
            oldIndex,
            targetNext,
            currentNext,
            nextEl,
            ctn    = this.container,
            oldVMs = this.oldVMs,
            vms    = []

        vms.length = newCollection.length

        // first pass, collect new reused and new created
        for (i = 0, l = newCollection.length; i < l; i++) {
            item = newCollection[i]
            if (isObject) {
                item.$index = i
                if (item.__emitter__ && item.__emitter__[this.identifier]) {
                    // this piece of data is being reused.
                    // record its final position in reused vms
                    item.$reused = true
                } else {
                    vms[i] = this.build(item, i, isObject)
                }
            } else {
                // we can't attach an identifier to primitive values
                // so have to do an indexOf...
                oldIndex = indexOf(oldVMs, item)
                if (oldIndex > -1) {
                    // record the position on the existing vm
                    oldVMs[oldIndex].$reused = true
                    oldVMs[oldIndex].$data.$index = i
                } else {
                    vms[i] = this.build(item, i, isObject)
                }
            }
        }

        // second pass, collect old reused and destroy unused
        for (i = 0, l = oldVMs.length; i < l; i++) {
            vm = oldVMs[i]
            item = this.arg
                ? vm.$data[this.arg]
                : vm.$data
            if (item.$reused) {
                vm.$reused = true
                delete item.$reused
            }
            if (vm.$reused) {
                // update the index to latest
                vm.$index = item.$index
                // the item could have had a new key
                if (item.$key && item.$key !== vm.$key) {
                    vm.$key = item.$key
                }
                vms[vm.$index] = vm
            } else {
                // this one can be destroyed.
                if (item.__emitter__) {
                    delete item.__emitter__[this.identifier]
                }
                vm.$destroy()
            }
        }

        // final pass, move/insert DOM elements
        i = vms.length
        while (i--) {
            vm = vms[i]
            item = vm.$data
            targetNext = vms[i + 1]
            if (vm.$reused) {
                nextEl = vm.$el.nextSibling
                // destroyed VMs' element might still be in the DOM
                // due to transitions
                while (!nextEl.vue_vm && nextEl !== this.ref) {
                    nextEl = nextEl.nextSibling
                }
                currentNext = nextEl.vue_vm
                if (currentNext !== targetNext) {
                    if (!targetNext) {
                        ctn.insertBefore(vm.$el, this.ref)
                    } else {
                        nextEl = targetNext.$el
                        // new VMs' element might not be in the DOM yet
                        // due to transitions
                        while (!nextEl.parentNode) {
                            targetNext = vms[nextEl.vue_vm.$index + 1]
                            nextEl = targetNext
                                ? targetNext.$el
                                : this.ref
                        }
                        ctn.insertBefore(vm.$el, nextEl)
                    }
                }
                delete vm.$reused
                delete item.$index
                delete item.$key
            } else { // a new vm
                vm.$before(targetNext ? targetNext.$el : this.ref)
            }
        }

        return vms
    },

    build: function (data, index, isObject) {

        // wrap non-object values
        var raw, alias,
            wrap = !isObject || this.arg
        if (wrap) {
            raw = data
            alias = this.arg || '$value'
            data = {}
            data[alias] = raw
        }
        data.$index = index

        var el = this.el.cloneNode(true),
            Ctor = this.compiler.resolveComponent(el, data),
            vm = new Ctor({
                el: el,
                data: data,
                parent: this.vm,
                compilerOptions: {
                    repeat: true,
                    expCache: this.expCache
                }
            })

        if (isObject) {
            // attach an ienumerable identifier to the raw data
            (raw || data).__emitter__[this.identifier] = true
        }

        return vm

    },

    unbind: function () {
        if (this.childId) {
            delete this.vm.$[this.childId]
        }
        if (this.vms) {
            var i = this.vms.length
            while (i--) {
                this.vms[i].$destroy()
            }
        }
    }
}

// Helpers --------------------------------------------------------------------

/**
 *  Find an object or a wrapped data object
 *  from an Array
 */
function indexOf (vms, obj) {
    for (var vm, i = 0, l = vms.length; i < l; i++) {
        vm = vms[i]
        if (!vm.$reused && vm.$value === obj) {
            return i
        }
    }
    return -1
}
});
require.register("yyx990803-vue/src/directives/on.js", function(exports, require, module){
var utils    = require('../utils')

/**
 *  Binding for event listeners
 */
module.exports = {

    isFn: true,

    bind: function () {
        this.context = this.binding.isExp
            ? this.vm
            : this.binding.compiler.vm
        if (this.el.tagName === 'IFRAME' && this.arg !== 'load') {
            var self = this
            this.iframeBind = function () {
                self.el.contentWindow.addEventListener(self.arg, self.handler)
            }
            this.el.addEventListener('load', this.iframeBind)
        }
    },

    update: function (handler) {
        if (typeof handler !== 'function') {
            utils.warn('Directive "v-on:' + this.expression + '" expects a method.')
            return
        }
        this.reset()
        var vm = this.vm,
            context = this.context
        this.handler = function (e) {
            e.targetVM = vm
            context.$event = e
            var res = handler.call(context, e)
            context.$event = null
            return res
        }
        if (this.iframeBind) {
            this.iframeBind()
        } else {
            this.el.addEventListener(this.arg, this.handler)
        }
    },

    reset: function () {
        var el = this.iframeBind
            ? this.el.contentWindow
            : this.el
        if (this.handler) {
            el.removeEventListener(this.arg, this.handler)
        }
    },

    unbind: function () {
        this.reset()
        this.el.removeEventListener('load', this.iframeBind)
    }
}
});
require.register("yyx990803-vue/src/directives/model.js", function(exports, require, module){
var utils = require('../utils'),
    isIE9 = navigator.userAgent.indexOf('MSIE 9.0') > 0,
    filter = [].filter

/**
 *  Returns an array of values from a multiple select
 */
function getMultipleSelectOptions (select) {
    return filter
        .call(select.options, function (option) {
            return option.selected
        })
        .map(function (option) {
            return option.value || option.text
        })
}

/**
 *  Two-way binding for form input elements
 */
module.exports = {

    bind: function () {

        var self = this,
            el   = self.el,
            type = el.type,
            tag  = el.tagName

        self.lock = false
        self.ownerVM = self.binding.compiler.vm

        // determine what event to listen to
        self.event =
            (self.compiler.options.lazy ||
            tag === 'SELECT' ||
            type === 'checkbox' || type === 'radio')
                ? 'change'
                : 'input'

        // determine the attribute to change when updating
        self.attr = type === 'checkbox'
            ? 'checked'
            : (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA')
                ? 'value'
                : 'innerHTML'

        // select[multiple] support
        if(tag === 'SELECT' && el.hasAttribute('multiple')) {
            this.multi = true
        }

        var compositionLock = false
        self.cLock = function () {
            compositionLock = true
        }
        self.cUnlock = function () {
            compositionLock = false
        }
        el.addEventListener('compositionstart', this.cLock)
        el.addEventListener('compositionend', this.cUnlock)

        // attach listener
        self.set = self.filters
            ? function () {
                if (compositionLock) return
                // if this directive has filters
                // we need to let the vm.$set trigger
                // update() so filters are applied.
                // therefore we have to record cursor position
                // so that after vm.$set changes the input
                // value we can put the cursor back at where it is
                var cursorPos
                try { cursorPos = el.selectionStart } catch (e) {}

                self._set()

                // since updates are async
                // we need to reset cursor position async too
                utils.nextTick(function () {
                    if (cursorPos !== undefined) {
                        el.setSelectionRange(cursorPos, cursorPos)
                    }
                })
            }
            : function () {
                if (compositionLock) return
                // no filters, don't let it trigger update()
                self.lock = true

                self._set()

                utils.nextTick(function () {
                    self.lock = false
                })
            }
        el.addEventListener(self.event, self.set)

        // fix shit for IE9
        // since it doesn't fire input on backspace / del / cut
        if (isIE9) {
            self.onCut = function () {
                // cut event fires before the value actually changes
                utils.nextTick(function () {
                    self.set()
                })
            }
            self.onDel = function (e) {
                if (e.keyCode === 46 || e.keyCode === 8) {
                    self.set()
                }
            }
            el.addEventListener('cut', self.onCut)
            el.addEventListener('keyup', self.onDel)
        }
    },

    _set: function () {
        this.ownerVM.$set(
            this.key, this.multi
                ? getMultipleSelectOptions(this.el)
                : this.el[this.attr]
        )
    },

    update: function (value, init) {
        /* jshint eqeqeq: false */
        // sync back inline value if initial data is undefined
        if (init && value === undefined) {
            return this._set()
        }
        if (this.lock) return
        var el = this.el
        if (el.tagName === 'SELECT') { // select dropdown
            el.selectedIndex = -1
            if(this.multi && Array.isArray(value)) {
                value.forEach(this.updateSelect, this)
            } else {
                this.updateSelect(value)
            }
        } else if (el.type === 'radio') { // radio button
            el.checked = value == el.value
        } else if (el.type === 'checkbox') { // checkbox
            el.checked = !!value
        } else {
            el[this.attr] = utils.guard(value)
        }
    },

    updateSelect: function (value) {
        /* jshint eqeqeq: false */
        // setting <select>'s value in IE9 doesn't work
        // we have to manually loop through the options
        var options = this.el.options,
            i = options.length
        while (i--) {
            if (options[i].value == value) {
                options[i].selected = true
                break
            }
        }
    },

    unbind: function () {
        var el = this.el
        el.removeEventListener(this.event, this.set)
        el.removeEventListener('compositionstart', this.cLock)
        el.removeEventListener('compositionend', this.cUnlock)
        if (isIE9) {
            el.removeEventListener('cut', this.onCut)
            el.removeEventListener('keyup', this.onDel)
        }
    }
}
});
require.register("yyx990803-vue/src/directives/with.js", function(exports, require, module){
var utils = require('../utils')

/**
 *  Binding for inheriting data from parent VMs.
 */
module.exports = {

    bind: function () {

        var self      = this,
            childKey  = self.arg,
            parentKey = self.key,
            compiler  = self.compiler,
            owner     = self.binding.compiler

        if (compiler === owner) {
            this.alone = true
            return
        }

        if (childKey) {
            if (!compiler.bindings[childKey]) {
                compiler.createBinding(childKey)
            }
            // sync changes on child back to parent
            compiler.observer.on('change:' + childKey, function (val) {
                if (compiler.init) return
                if (!self.lock) {
                    self.lock = true
                    utils.nextTick(function () {
                        self.lock = false
                    })
                }
                owner.vm.$set(parentKey, val)
            })
        }
    },

    update: function (value) {
        // sync from parent
        if (!this.alone && !this.lock) {
            if (this.arg) {
                this.vm.$set(this.arg, value)
            } else if (this.vm.$data !== value) {
                this.vm.$data = value
            }
        }
    }

}
});
require.register("yyx990803-vue/src/directives/html.js", function(exports, require, module){
var utils = require('../utils'),
    slice = [].slice

/**
 *  Binding for innerHTML
 */
module.exports = {

    bind: function () {
        // a comment node means this is a binding for
        // {{{ inline unescaped html }}}
        if (this.el.nodeType === 8) {
            // hold nodes
            this.nodes = []
        }
    },

    update: function (value) {
        value = utils.guard(value)
        if (this.nodes) {
            this.swap(value)
        } else {
            this.el.innerHTML = value
        }
    },

    swap: function (value) {
        var parent = this.el.parentNode,
            nodes  = this.nodes,
            i      = nodes.length
        // remove old nodes
        while (i--) {
            parent.removeChild(nodes[i])
        }
        // convert new value to a fragment
        var frag = utils.toFragment(value)
        // save a reference to these nodes so we can remove later
        this.nodes = slice.call(frag.childNodes)
        parent.insertBefore(frag, this.el)
    }
}
});
require.register("yyx990803-vue/src/directives/style.js", function(exports, require, module){
var prefixes = ['-webkit-', '-moz-', '-ms-']

/**
 *  Binding for CSS styles
 */
module.exports = {

    bind: function () {
        var prop = this.arg
        if (!prop) return
        if (prop.charAt(0) === '$') {
            // properties that start with $ will be auto-prefixed
            prop = prop.slice(1)
            this.prefixed = true
        }
        this.prop = prop
    },

    update: function (value) {
        var prop = this.prop,
            isImportant
        /* jshint eqeqeq: true */
        // cast possible numbers/booleans into strings
        if (value != null) value += ''
        if (prop) {
            if (value) {
                isImportant = value.slice(-10) === '!important'
                    ? 'important'
                    : ''
                if (isImportant) {
                    value = value.slice(0, -10).trim()
                }
            }
            this.el.style.setProperty(prop, value, isImportant)
            if (this.prefixed) {
                var i = prefixes.length
                while (i--) {
                    this.el.style.setProperty(prefixes[i] + prop, value, isImportant)
                }
            }
        } else {
            this.el.style.cssText = value
        }
    }

}
});
require.register("yyx990803-vue/src/directives/partial.js", function(exports, require, module){
var utils = require('../utils')

/**
 *  Binding for partials
 */
module.exports = {

    isLiteral: true,

    bind: function () {

        var id = this.expression
        if (!id) return

        var el       = this.el,
            compiler = this.compiler,
            partial  = compiler.getOption('partials', id)

        if (!partial) {
            if (id === 'yield') {
                utils.warn('{{>yield}} syntax has been deprecated. Use <content> tag instead.')
            }
            return
        }

        partial = partial.cloneNode(true)

        // comment ref node means inline partial
        if (el.nodeType === 8) {

            // keep a ref for the partial's content nodes
            var nodes = [].slice.call(partial.childNodes),
                parent = el.parentNode
            parent.insertBefore(partial, el)
            parent.removeChild(el)
            // compile partial after appending, because its children's parentNode
            // will change from the fragment to the correct parentNode.
            // This could affect directives that need access to its element's parentNode.
            nodes.forEach(compiler.compile, compiler)

        } else {

            // just set innerHTML...
            el.innerHTML = ''
            el.appendChild(partial)

        }
    }

}
});
require.register("yyx990803-vue/src/directives/view.js", function(exports, require, module){
/**
 *  Manages a conditional child VM using the
 *  binding's value as the component ID.
 */
module.exports = {

    bind: function () {

        // track position in DOM with a ref node
        var el       = this.raw = this.el,
            parent   = el.parentNode,
            ref      = this.ref = document.createComment('v-view')
        parent.insertBefore(ref, el)
        parent.removeChild(el)

        // cache original content
        /* jshint boss: true */
        var node,
            frag = this.inner = document.createElement('div')
        while (node = el.firstChild) {
            frag.appendChild(node)
        }

    },

    update: function(value) {

        this.unbind()

        var Ctor  = this.compiler.getOption('components', value)
        if (!Ctor) return

        this.childVM = new Ctor({
            el: this.raw.cloneNode(true),
            parent: this.vm,
            compilerOptions: {
                rawContent: this.inner.cloneNode(true)
            }
        })

        this.el = this.childVM.$el
        if (this.compiler.init) {
            this.ref.parentNode.insertBefore(this.el, this.ref)
        } else {
            this.childVM.$before(this.ref)
        }

    },

    unbind: function() {
        if (this.childVM) {
            this.childVM.$destroy()
        }
    }

}
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-reduce/index.js", function(exports, require, module){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
});
require.register("smtc-superagent/lib/client.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

var Authentication = "Authentication",
    token = null;

// 获取token
function getToken() {
	token = token === null 
			? localStorage.getItem(Authentication)
			: token
	return token
}

function setToken(t) {
    if (!t) return
	token = t
	localStorage.setItem(Authentication, t)
}

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.xhr.responseText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var res = new Response(self);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  setToken(res.header[Authentication] || res.header[Authentication.toLowerCase()]);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn, sync){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  //xhr.open(this.method, this.url, true);
  xhr.open(this.method, this.url, !sync);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  var req
  // url first
  if (1 === arguments.length || 'function' === typeof url)
  	req = new Request('GET', method)
  else
    req = new Request(method, url)

  if (getToken()) req.set(Authentication, token)

  // callback
  if ('function' === typeof url)
   	return req.end(url)

  return req
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */
module.exports = request;

});
require.register("vui/src/prototype.js", function(exports, require, module){
// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


});
require.register("vui/src/main.js", function(exports, require, module){
var Vue             = require('vue'),
    request         = require('./request'),
    _location       = require('./location'),
    route           = require('./route'),
	utils           = require('./utils'),
    openbox         = require('./components/openbox'),
    loading         = require('./components/loading'),
    message         = require('./components/message'),
    tree            = require('./components/tree'),
    form            = require('./components/form'),
    page            = require('./components/page'),
    lang            = require('./lang/lang'),
    string          = require('./filters/string'),
    $data           = {},
    initialized     = false,
    vm

// register prototype
require('./prototype')

var components = {
    'date': require('./components/date'),
    'form': form.form,
    'form-struct': form['form-struct'],
    'form-control': require('./components/form-control'),
    'loading': loading.component,
    'message': message.component,
    'option': require('./components/option'),
    'page': page.page,
    'page-struct': page['page-struct'],
    'pagination': require('./components/pagination'),
    'scope': require('./components/scope'),
    'select': require('./components/select'),
    'tree': tree.tree,
    'tree-folder': tree.folder,
    'tree-file': tree.file
}

function init() {
    if (initialized) return
    initialized = true

    vm = new Vue({

        el: 'body',

        methods: {
            openbox: openbox
        },

        directives: {
            editable: require('./directives/editable'),
            href: require('./directives/href')
        },

        filters: {
            format: string.format,
            icon: require('./filters/icon')
        },

        components: components,

        data: $data

    })
}

// export Vue
window.Vue = Vue

//set default language
lang.set('zh-cn')

module.exports = {
    request: request,
    utils: utils,
    route: route,
    $data: $data,
    location: _location,
    loading: loading,
    message: message,
    openbox: openbox,
    init: init,
    setLang: lang.set,
    Vue: Vue,
    vm: vm,
    
    require: function (path) {
        try {
            return require('./' + path)
        } catch (e) {
            return Vue.require(path)
        }
    }
}


});
require.register("vui/src/utils.js", function(exports, require, module){
/*
 * 工具包，大部分代码来自angularjs
 */
var hasOwnProp      = Object.prototype.hasOwnProperty,
    slice           = [].slice,
    //push            = [].push,
    toString        = Object.prototype.toString,
    uid             = ['A', '0', '0', '0']
 

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
    if (!value) return false;
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




////////////////////////////////////////////////////////////////
//
function hashCode(obj) {
    if (null === obj || undefined === obj) obj = ""
    if ("string" !== typeof obj) obj = obj.toString()

    var hash = 0, i, chr, len;
    if (obj.length === 0) return hash;
    for (i = 0, len = obj.length; i < len; i++) {
        chr   = obj.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}


function substitute(str, obj) {
    return str.replace((/\\?\{([^{}]+)\}/g), function(match, name){
        if (match.charAt(0) == '\\') return match.slice(1);
        return (obj[name] != null) ? obj[name] : '';
    })
}


function format(str, arr) {
    return str.replace(/{(\d+)}/g, function(match, number) { 
        return typeof arr[number] != 'undefined'
            ? arr[number] 
            : match
    })
}


var hasClassList    = 'classList' in document.documentElement,
    urlParsingNode  = document.createElement("a")


/**
 * IE 11 changed the format of the UserAgent string.
 * See http://msdn.microsoft.com/en-us/library/ms537503.aspx
 */
var msie = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
if (isNaN(msie)) {
    msie = parseInt((/trident\/.*; rv:(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
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
        pathname,
        colon = []

    if (msie) {
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

    pathname = urlParsingNode.pathname
    if (pathname.indexOf(':') >= 0) {
        var cs = pathname.substr(pathname.indexOf(':') + 1)
        colon = cs.split('/')
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
        colon: colon,
        pathname: (urlParsingNode.pathname.charAt(0) === '/')
            ? urlParsingNode.pathname
            : '/' + urlParsingNode.pathname
    };
}


if(typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, ''); 
    }
}


/**
 *  add class for IE9
 *  uses classList if available
 */
function addClass(el, cls) {
    if (hasClassList) {
        el.classList.add(cls)
    } else {
        var cur = ' ' + el.className + ' '
        if (cur.indexOf(' ' + cls + ' ') < 0) {
            el.className = (cur + cls).trim()
        }
    }
}

/**
 *  remove class for IE9
 */
function removeClass(el, cls) {
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
}

function hasClass(el, cls) {
    var cur = ' ' + el.className + ' '
    return cur.indexOf(' ' + cls + ' ') >= 0
}

function toggleClass(el, cls) {
    if (hasClass(el, cls))
        removeClass(el, cls)
    else
        addClass(el, cls)
}

function isDescendant(parent, child) {
     var node = child.parentNode;
     while (node != null) {
         if (node == parent) {
             return true;
         }
         node = node.parentNode;
     }
     return false;
}

// 合并 ./node
module.exports = {
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
    'hashCode': hashCode,
    'makeMap': makeMap,
    'toKeyValue': toKeyValue,
    'parseKeyValue': parseKeyValue,
    'nextUid': nextUid,
    'encodeUriQuery': encodeUriQuery,
    'encodeUriSegment': encodeUriSegment,
    'substitute': substitute,
    'format': format,
    isDescendant: isDescendant,
    addClass: addClass,
    hasClass: hasClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    urlResolve: urlResolve
}

});
require.register("vui/src/location.js", function(exports, require, module){
var utils            = require("./utils"),
    encodeUriSegment = utils.encodeUriSegment,
    urlResolve       = utils.urlResolve,
    lastBrowserUrl   = originUrl,
    html5Mode        = false,
    originUrl        = urlResolve(window.location.href, true),
    isUndefined      = utils.isUndefined,
    _location


/**
 * Parse a request URL and determine whether this is a same-origin request as the application document.
 *
 * @param {string|object} requestUrl The href of the request as a string that will be resolved
 * or a parsed URL object.
 * @returns {boolean} Whether the request is for the same origin as the application document.
 */
function hrefIsSameOrigin(requestUrl) {
    var parsed = (utils.isString(requestUrl)) ? urlResolve(requestUrl) : requestUrl
    return (parsed.protocol === originUrl.protocol &&
            parsed.host === originUrl.host)
}


/**
 * Encode path using encodeUriSegment, ignoring forward slashes
 *
 * @param {string} path Path to encode
 * @returns {string}
 */
function encodePath(path) {
    var segments = path.split('/'),
        i = segments.length

    while (i--) {
        segments[i] = encodeUriSegment(segments[i])
    }

    return segments.join('/')
}



function setMode(mode) {
    html5Mode = 'html5' === mode ? true : false
    return _location
}


function url(href, replace) {
    // Android Browser BFCache causes _location, history reference to become stale.
    //if (_location !== window.location) _location = window.location
    //if (history !== window.history) history = window.history

    // setter
    if (href) {
        //if (lastBrowserUrl === href) return
        //lastBrowserUrl = href
        if (html5Mode) {
            if (replace) window.history.replaceState(null, '', href)
            else {
                window.history.pushState(null, '', href)
                // Crazy Opera Bug: http://my.opera.com/community/forums/topic.dml?id=1185462
                //baseElement.attr('href', baseElement.attr('href'))
            }
        } else {
            var c = href.charAt(0)
            if (c !== '/' && c !== '.') href = "#!/" + href
            if (replace)
                window.location.replace(href)
            else
                window.location.href = href
        }
        return _location
        // getter
    } else {
        // - newL)cation is a workaround for an IE7-9 issue with _location.replace and _location.href
        //   methods not updating _location.href synchronously.
        // - the replacement is a workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=407172
        return window.location.href.replace(/%27/g,"'")
    }
}

function node(fixHash) {
    return urlResolve(url(), fixHash)
}

// create url
function compose(raw) {
    var search = raw.search,
        hash = raw.hash,
        path,
        end

    if (html5Mode)
        end = raw.pathname
    else {
        path = urlResolve(url()).pathname
        path = path.slice(0, path.lastIndexOf('/') + 1)
        end = raw.pathname.replace(path, '')
    }

    end = encodePath(end)

    return url(end + (search ? '?' + search : '') + (hash ? '#' + encodeUriSegment(hash) : ''))
}

function search(query, value) {
    var raw = urlResolve(url(), !html5Mode),
        _search = utils.parseKeyValue(raw.search)

    switch(arguments.length) {
        case 0:
            return utils.parseKeyValue(raw.search)
        case 1:
            if (utils.isString(query))
                query = utils.toKeyValue(query)
            _search = query
            break
        default:
            if (null === value || isUndefined(value))
                delete _search[query]
            else
                _search[query] = value
    }
    raw.search = utils.toKeyValue(_search)
    return compose(raw)
}

function hash(value) {
    var raw = urlResolve(url(), !html5Mode)
    if (arguments.length === 0)
        return raw.hash

    raw.hash = value
    return compose(raw)
}


_location = module.exports = {
    setMode: setMode,
    search: search,
    hash: hash,
    url: url,
    node: node
}


});
require.register("vui/src/route.js", function(exports, require, module){
var Vue         = require('vue'),
    utils       = require('./utils'),
    _location   = require('./location'),
    urlResolve  = utils.urlResolve,
    request     = require('./request'),
    lastPath    = urlResolve(_location.url()).pathname,
    fns         = {},
    components  = {}

function route(fn, init) {
    function getComponent(fn) {
        var path = utils.urlResolve(_location.url(), true).pathname
        route.getComponent(path, fn)
    }

    route.bind(function () {
        getComponent(fn)
    }, true)
    if (init) {
        getComponent(fn)
    }
}


// basepath 为true时，只验证path部分
route.bind = function (fn, basepath) {
    if (!fn) return this
    var hash = utils.hashCode(fn)

    if (fns.hasOwnProperty(hash)) return this
    
    var self = this,
        f = function () {
            if (basepath) {
                var url = urlResolve(_location.url(), true)
                if (url.pathname === lastPath) return this
                lastPath = url.pathname
            }
            fn()
        }
    window.addEventListener('hashchange', f)
    fns[hash] = f
}

// fn 为空时删除所有绑定事件
route.unbind = function (fn) {
    var hash = utils.hashCode(fn)

    utils.forEach(fns, function (f, h) {
        // 当fn为空或者与fns hash值相等时
        if (hash == 0 || hash == h) {
            window.removeEventListener('hashchange', f)
            delete fns[h]
        }
    })
}


route.getComponent = function (path, fn) {
    if (!components[path]) {
        components[path] = true

        request.getTemplate(path)
            .end(function (template) {
                Vue.component(path, {
                    template: template
                })
                fn(path)
            })
    } else {
        fn(path)
    }
}

module.exports = route


});
require.register("vui/src/request.js", function(exports, require, module){
// 暂时先用superagent

var request       = require('superagent'),
    templateCache = {}

// 从缓存中读取
function Template(src) {
    this.template = templateCache[src]
}
    
Template.prototype.end = function (fn) {
    fn(this.template)
}


// 从服务器读取
function TemplateRequest(src) {
    this.req = request.get(src)
    this.src = src
}

TemplateRequest.prototype.end = function (fn) {
    this.req.end(function (res) {
        fn(res.text)
        templateCache[this.src] = res.text
    }.bind(this))
}


request.getTemplate = function (src) {
    if (templateCache[src]) 
        return new Template(src)
    else
        return new TemplateRequest(src)
}

module.exports = request

});
require.register("vui/src/directives/href.js", function(exports, require, module){
var _location = require('../location')

module.exports = {
    isLiteral: true,

    bind: function () {
        var self = this
        self.el.setAttribute('href', self.expression)
        self.el.addEventListener('click', function (event) {
            event.preventDefault()
            _location.url(self.expression)
        })
    },

    unbind: function () {
    }

}

});
require.register("vui/src/directives/editable.js", function(exports, require, module){
module.exports = {

    bind: function () {
        this.el.innerHTML = this.compiler.data[this.key]
        this.el.setAttribute('contentEditable', true)
        this.el.addEventListener('keyup', function () {
            this.compiler.data[this.key] = this.el.innerHTML
        }.bind(this))
    },

    unbind: function (value) {
        this.el.innerHTML = value
    }

}

});
require.register("vui/src/components/date.js", function(exports, require, module){
var utils = require('../utils')

function pad(v) {
    v = v.toString()
    if (v.length === 1)
        v = '0' + v
    return v
}

function Day(d) {
    this.year = d.getFullYear()
    this.month = d.getMonth()
    this.date = d.getDate()
    this.weekday = d.getDay()
    this.str = this.year + '-' + pad(this.month + 1) + '-' + pad(this.date)
}

var STATUS = { DAY:1, MONTH:2, YEAR:3 }

module.exports = {
    template: require('./date.html'),
    replace: true,
    paramAttributes: ['placeholder'],

    methods: {
        open: function () {
            if (this.$open) return
            this.$open = true

            this.status = STATUS.DAY
            this.showDate = utils.copy(this.currentDate)

            // 需要设置延时，否则会点击open时会触发关闭事件
            // pc端可以用mouseup处理不需要延时，没测试touch是否响应
            setTimeout(function () {
                this.draw()
                utils.addClass(this.$el, 'active')
                document.body.addEventListener('click', this.$closeHandle)
            }.bind(this), 50)
        },

        close: function () {
            if (!this.$open) return
            this.$open = false

            utils.removeClass(this.$el, 'active')
            document.body.removeEventListener('click', this.$closeHandle)
        },

        set: function (day, event) {
            this.date = day.str
            this.currentDate = {
                year: day.year,
                month: day.month,
                day: day.date
            }

            setTimeout(function () {
                this.close()
            }.bind(this), 50)
        },

        setYear: function (y) {
            this.showDate.year = y
            this.status = STATUS.MONTH
        },

        setMonth: function (m) {
            this.showDate.month = m
            this.status = STATUS.DAY
            this.draw()
        },

        change: function (m) {
            switch (this.status) {
                case STATUS.YEAR:
                    this.changeYear(m)
                    break
                case STATUS.MONTH:
                    this.showDate.year += m
                    break
                case STATUS.DAY:
                    this.changeMonth(m)
                    break
            }
        },

        changeMonth: function (m) {
            var cd = this.showDate
            cd.month += m

            if (cd.month < 0) {
                cd.month += 12
                cd.year -= 1
            } else if (cd.month > 11) {
                cd.month -= 12
                cd.year += 1
            }

            this.draw()
        },

        changeYear: function (m) {
            var year = this.showDate.year += 12 * m

            this.years = []

            for (var i=year-12, j=year+12; i <= j; i++) {
                this.years.push(i)
            }
        },

        statusToggle: function () {
            this.status++
            if (this.status > 3)
                this.status = 1
        },

        draw: function () {
            var cd = this.showDate,
                year = cd.year,
                month = cd.month,
                first = new Date(cd.year, cd.month, 1),
                end = new Date(cd.year, cd.month + 1, 0),
                min = 1 - first.getDay(),
                max = (Math.ceil((end.getDate() - min + 1) / 7) * 7)

            this.days = []

            for (var date, i = 0; i < max; i++) {
                date = new Date(year, month, i+min)
                this.days.push(new Day(date))
            }

        }
    },
    
    data: {
        date: null,
        currentDate: {},
        showDate: {},
        status: STATUS.DAY,
        today: new Date()
    },

    created: function () {
        var self = this,
            d = new Date()

        if (this.date)
            d = new Date(this.date)

        this.currentDate = {
            year: d.getFullYear(),
            month: d.getMonth(),
            day: d.getDate()
        }

        this.showDate = utils.copy(this.currentDate)

        this.draw()
        this.changeYear(0)

        if (this.$el.getAttribute('up') === 'true')
            this.pickerUp = true

        // 点击页面空白关闭
        this.$closeHandle = function (event) {
            if (utils.isDescendant(self.$el, event.target))
                return

            self.close()
        }
    }

}

});
require.register("vui/src/components/form.js", function(exports, require, module){
var utils       = require('../utils'),
    request     = require('../request'),
    _location    = require('../location'),
    lang        = require('../lang/lang'),
    loading     = require('./loading'),
    message     = require('./message')

function getStruct(struct) {
    struct = struct || []
    var hs = []
    utils.forEach(struct, function (v, i) {
        if (v.edit) hs.push(v)
    })
    return hs
}

// buttons =========================================================
var EDIT_OP = {
    "back": '<a class="btn btn-info" href="javascript:;" v-on="click:back"><i class="icon icon-reply"></i> {text}</a>'
}

function getEditOp(src) {
    var ops = [],
        op = '',
        obj
    src = src || {}
    utils.forEach(src, function (v, k) {
        op = EDIT_OP[k]
        if (!op) return
        obj = {
            // {{key}} replace {{d.key}}，模板需要用d.key取值
            op: v.replace(/\{\{([^{}]*)\}\}/g, "{{d.$1}}"),
            text: lang.get('button.' + k)
        }
        ops.push(utils.substitute(op, obj))
    })
    return ops.join('&nbsp; ')
}

// form controls ====================================================
function getControls(struct) {
    var controls = [],
        str

    function addIf(k, s) {
        if (s[k] === undefined) return ''
        return k + '="' + s[k] + '" '
    }

    function getCol(s) {
        var str = ''
        if (s.maxlen) {
            if (s.maxlen < 50) {
                str += 'col=",6" '
            } else {
                str += 'col=",12" '
            }
        } else {
            switch (s.type) {
                case 'integer':
                case 'select':
                    str += 'col=",4" '
                    break
            }
        }
        return str
    }

    function getType(s) {
        if (s.type === undefined || s.type === 'text' || s.type === 'textarea') {
            if (s.maxlen < 200)
                return 'type="text" '
            else
                return 'type="textarea" rows="6" '
        }

        if (s.type === 'bool')
            return 'type="checkbox" options="\'{text}\':true" '

        return 'type="' + s.type + '" '
    }

    struct.forEach(function (s) {
        str = '<form-control '

        if (s.type !== 'bool') str += 'label="{text}" '

        str += 'name="{key}" '

        if (s.equal) str += 'v-with="value:model.{key},equal:model.{equal}" '
        else str += 'v-with="value:model.{key}" '

        str += getCol(s)
        str += getType(s)
        utils.forEach(['min', 'max', 'minlen', 'maxlen', 'src', 'require', 'tip'], function (k) {
            str += addIf(k, s)
        })
        str += '></form-control>'
        controls.push(utils.substitute(str, s))
    })
    controls.push(utils.substitute('<form-control><button class="btn btn-primary" type="submit">{text}</button></form-control>', {text:lang.get('button.submit')}))
    return controls.join('')
}

var component = {
    //template: require('./form.html'),
    methods: {
        back: function () {
            window.history.back()
        },
        
        success: function (json) {
            this.back()
        }
    },

    data: {
        struct: null,
        content: ''
    },

    created: function () {
        this.valid = true
        this.controls = {}
        this.model = {}
        this.colon = _location.node(true).colon

        this.src = this.$el.getAttribute('action') || this.$el.getAttribute('src')

        var struct = this.$el.getAttribute("struct")
        if (struct) {
            struct = utils.format(struct, this.colon)
            loading.start()
            // use sync 
            request.get(struct).end(function (res) {
                loading.end()
                if (res.status !== 200 || res.body.status !== 1) {
                    message.error(res.body.errors, res.status)
                    return
                }

                this.struct = getStruct(res.body.struct)
                // if struct has src, use struct.src
                if (res.body.src)
                    this.src = res.body.src
                this.content = getControls(this.struct)
            }.bind(this), true)
        }

        if (this.src) {
            this.src = utils.format(this.src, this.colon)
        }
    },

    ready: function () {
        var node = _location.node(true),
            search = node.search,
            hash = node.hash
        request.get(this.src + hash).query(search).end(function (res) {
            if (res.status === 200) {
                if (res.body.status === 1 || res.body.data)
                    this.model = res.body.data || {}
                else if (res.body.errors)
                    message.error(res.body.errors)
            } else {
                //message.error('', res.status)
            }
        }.bind(this))


        var form = this.$el;
        if (form.tagName != "FORM")
            form = form.querySelector('form')

        form.addEventListener('submit', function (event) {
            event.preventDefault()
            this.$broadcast('check')
            this.valid = true

            utils.forEach(this.controls, function (v, k) {
                this.valid = this.valid && v
            }.bind(this))

            if (this.valid) {
                loading.start()
                request.post(this.src).send(this.model).end(function (res) {
                    loading.end()
                    if (res.status === 200) {
                        if (res.body.status === 1) {
                            this.success(res.body)
                        } else {
                            message.error(res.body.errors)
                        }
                    } else {
                        message.error('', res.status)
                    }
                }.bind(this))
            }
        }.bind(this))
    }
}

var component_struct = utils.copy(component)
component_struct.template = '<form v-show="struct" class="form-horizontal" v-html="content" role="form"></form>'

module.exports = {
    'form': component,
    'form-struct': component_struct
}

});
require.register("vui/src/components/form-control.js", function(exports, require, module){
var utils = require('../utils'),
    lang  = require('../lang/lang')

function getCol(str, label) {
    var col = [2, 6]

    if (str) {
        var ss = str.split(',')
        utils.forEach(ss, function (s, i) {
            try {
                ss[i] = parseInt(s)
            } catch (e) {}
        })
        col = [ ss[0] || 2, ss[1] || 6 ]
    }

    return col
}

var TEMPLATES = {
        'submit': '<button class="btn" type="submit">{{_text}}</button>',
        'button': '<button class="btn" type="button">{{_text}}</button>',
        'radio': '<div type="radio" v-component="option" name="{{_name}}" v-with="value:value" inline="{{_inline}}" src="{{_src}}" options="{{_options}}"></div>',
        'checkbox': '<div type="checkbox" v-component="option" name="{{_name}}" v-with="value:value" inline="{{_inline}}" src="{{_src}}" options="{{_options}}"></div>',
        'textarea': '<textarea class="form-control col-sm-{{_col[1]}}" v-attr="readonly:_readonly" name="{{_name}}" v-model="value" rows="{{_rows}}"></textarea>',
        'select': '<div class="form-control select col-sm-{{_col[1]}}" src="{{_src}}" v-with="value:value" v-component="select"></div>',
        'tree': '<ul v-with="value:value" selectable="{{_selectable}}" select="{{_select}}" src="{{_src}}" v-component="tree"></ul>',
        'date': '<div class="form-control date col-sm-{{_col[1]}}" v-component="date" v-with="date:value" id="{{id}}" name="{{_name}}"></div>',
        'integer': '<input class="form-control col-sm-{{_col[1]}}" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="text" />',
        'alpha': '<input class="form-control col-sm-{{_col[1]}}" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="text" />',
        'alphanum': '<input class="form-control col-sm-{{_col[1]}}" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="text" />',
        'default': '<input class="form-control col-sm-{{_col[1]}}" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="{{_type}}" />',
        'empty': ''
    },

    REGS = {
        'email': /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*$/i,
        'url': /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        'number': /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/,
        'date': /^(\d{4})-(\d{2})-(\d{2})$/,
        'alpha': /^[a-z ._-]+$/i,
        'alphanum': /^[a-z0-9_]+$/i,
        'password': /^[\x00-\xff]+$/,
        'integer': /^[-+]?[0-9]+$/,
        'tel': /^[\d\s ().-]+$/
    },

    MSGS,

    TIPS

// 必填
function _require() {
    var empty = 'string' === (typeof this.value) ? this.value.trim() === '' : false
    if (empty || undefined === this.value || null === this.value || [] === this.value)
        this.fail('require')
    else
        this.pass()
}


function _len(val, t) {
    var len = 0,
        tip = ''
    if (this._type === 'checkbox')
        t += '_cb'
   
    if (t.indexOf('len') >= 0)
        len = this.value.toString().length
    else
        len = parseInt(this.value) || 0

    if (t.indexOf('min') >= 0)
        this.valid = len >= val
    else
        this.valid = len <= val

    if (this.valid)
        this.pass()
    else
        this.fail(t)
}


// 正则
function regex(reg) {
    if (reg.test(this.value))
        this.pass()
    else
        this.fail(this._type, 'regex')
}

// 判断值相等（密码确认）
function equal() {
    if (this.value === this.equal)
        this.pass()
    else
        this.fail('tip')
}

// 设置初始提示
function initMessage() {
    var i = this.checkList.length,
        tip = '',
        t = ''
    while(i--) {
        t = this.checkList[i][0]
        switch(t) {
            case 'require':
                tip += TIPS[t] + ', '
                break
            case 'max':
            case 'maxlen':
            case 'min':
            case 'minlen':
                if (this._type === 'checkbox') t += '_cb'
                tip += TIPS[t] + ', '
                break
        }
    }

    // 设置type初始值
    switch(this._type) {
        case 'alpha':
        case 'alphanum':
            tip += MSGS[this._type] + ', '
            break
    }

    tip = (utils.substitute(tip, this) + (this._tip || '')).trim()
    var last = tip.lastIndexOf(',')

    if (last === tip.length - 1)
        tip = tip.substr(0, tip.length - 1)

    this.message = tip
}


module.exports = {
    template: require('./form-control.html'),
    replace: true,

    methods: {
        check: function () {
            this.valid = true
            var i = this.checkList.length,
                ck

            if (this.valid && REGS[this._type] && this.value)
                regex.call(this, REGS[this._type])

            if (this.valid && this.equal)
                equal.call(this)

            while(i-- && this.valid) {
                ck = this.checkList[i]
                switch(ck[0]) {
                    case 'max':
                    case 'maxlen':
                    case 'min':
                    case 'minlen':
                        _len.call(this, ck[1], ck[0])
                        break
                    case 'require':
                        _require.call(this)
                        break
                }
            }
        },

        pass: function () {
            this.valid = true
            this.message = ''
            this.$parent.controls[this.id] = true
        },

        fail: function (k, b) {
            this.valid = false
            this.message = utils.substitute(MSGS[k] || MSGS[b], this)
            this.$parent.controls[this.id] = false
        }
    },

    data: {},

    created: function () {
        TIPS = lang.get('validation.tips')
        MSGS = lang.get('validation.msgs')

        this.id = utils.nextUid()
        this.pass()
        this.checkList = []

        // set attr
        utils.forEach(['label', 'src', 'text', 'name', 'rows', 'readonly', 'options', 'inline', 'tip', 'selectable', 'select'], function (attr) {
            this['_' + attr] = this.$el.getAttribute(attr)
            this.$el.removeAttribute(attr)
        }.bind(this))

        // validate
        utils.forEach(['max', 'min', 'maxlen', 'minlen', 'require'], function (attr) {
            if (!this.$el.hasAttribute(attr)) return

            this.checkList.push([attr, this.$el.getAttribute(attr)])
            this['_' + attr] = this.$el.getAttribute(attr) || true
            this.$el.removeAttribute(attr)
        }.bind(this))

        // type
        this._type = this.$el.getAttribute('type') || 'empty'
        this._col = getCol(this.$el.getAttribute('col'), this._label)
        this._content = undefined === TEMPLATES[this._type] ? TEMPLATES['default'] : TEMPLATES[this._type]
        if (this._inline && this._type !== 'checkbox' && this._type !== 'radio')
            this._content += '<p class="help-inline">{{message}}</p>';
        else
            this._content += '<p class="help-block">{{message}}</p>';

        // clear type
        utils.forEach(['type', 'col'], function (attr) {
            this.$el.removeAttribute(attr)
        }.bind(this))

        this.$on('check', function () {
            this.check()
        }.bind(this))

        // tip
        initMessage.call(this)

        this.$parent.controls[this.id] = true
    },

    ready: function () {
        this.$watch('value', function () {
            this.check()
        }.bind(this))
    }
}

});
require.register("vui/src/components/loading.js", function(exports, require, module){
var utils   = require('../utils'),
    handle  = { status: 0 }

var component = {
    template:   '<div v-transition v-show="handle.status > 0" class="loading">' +
                    '<div class="overlay"></div>' +
                    '<label><img v-show="img" v-attr="src:img" />{{text}}</label>' +
                '</div>',

    replace: true,

    data: {
        handle: handle,
        img: '',
        text: ''
    },

    created: function () {
        this.img = this.$el.getAttribute('img')
        this.text = this.$el.getAttribute('text')
        this.$el.removeAttribute('img')
        this.$el.removeAttribute('text')
    }

}

module.exports = {
    start: function () {
        handle.status++
    },

    end: function () {
        handle.status--
    },

    component: component
}

});
require.register("vui/src/components/message.js", function(exports, require, module){
/* 
 * message { text: '', type: '' }
 */
var utils       = require('../utils'),
    lang        = require('../lang/lang'),
    messages    = []

var component = {
    template:   '<div v-show="messages.length>0">' +
                '<div v-repeat="messages" class="alert alert-{{type}}">' +
                    '<strong>{{time}}</strong><br />' +
                    '{{text}}' +
                    '<button v-on="click: remove(this)" class="close">&times;</button>' +
                '</div>' +
                '</div>',

    replace: true,

    data: {
        messages: messages
    },

    methods: {
        remove: function (item) {
            //utils.arrayRemove(messages, item.$data)
            this.messages.$remove(item.$data)
        }
    }
}

module.exports = {
    push: function (msg, type) {
        if ('string' === typeof msg) {
            msg = {
                text: msg,
                type: type || 'warning',
                time: new Date().format('yyyy-MM-dd hh:mm:ss')
            }
        }
        messages.push(msg)

        var timeout = msg.timeout || (msg.type === 'danger' ? 0 : 5000)
        if (timeout != 0)
            setTimeout(function () {
                utils.arrayRemove(messages, msg)
            }, timeout)
    },

    success: function (msg) {
        this.push(msg, 'success')
    },
    
    error: function (msg, status) {
        if (!msg && status)
            msg = lang.get('httpStatus.' + status)
        this.push(msg || "", 'danger')
    },
    
    info: function (msg) {
        this.push(msg, 'info')
    },

    warn: function (msg) {
        this.push(msg, 'warning')
    },
    
    messages: messages,

    component: component
}

});
require.register("vui/src/components/openbox.js", function(exports, require, module){
var Vue     = require('vue'),
    utils   = require('../utils'),
    lang    = require('../lang/lang'),
    //request = require('../request'),
    route   = require('../route')

/*
 * show: default -false 创建时是否显示
 * callback: [function, this] 关闭时回调方法
 */

function openbox(opts) {
    var callback = opts.callback,

        data = utils.extend({
            title: opts.title,
            width: opts.width || 6,
            model: {},
            btns: [],
            body: opts.body,
            src: opts.src
        }, opts.data),

        Openbox = Vue.extend({
            template: require('./openbox.html'),
            replace: true,
            methods: {
                show: function () {
                    //utils.addClass(this.$el, 'open')
                    this.$open = true
                },
                bgclose: function (e) {
                    var box = this.$el.querySelector('.openbox-content')
                    if (e.target === box || utils.isDescendant(box, e.target)) return
                    this.close()
                },
                close: function (suc) {
                    if (suc && callback) callback(this.model)
                    this.$destroy()
                },
                getComponent: function () {
                }
            },
            data: data,
            created: function () {
                document.body.appendChild(this.$el)
                this.$open = false
                this.btns = []
                if (opts.btns) {
                    var self = this
                    utils.forEach(opts.btns, function (btn) {
                        if (typeof btn === 'string') {
                            switch(btn) {
                                case 'close':
                                    self.btns.push({ text: lang.get('button.close'), type:'default', fn: self.close.bind(self) })
                                    break
                                case 'ok':
                                    self.btns.push({ text: lang.get('button.ok'), type:'primary', fn: self.close.bind(self, true) })
                                    break
                            }
                        } else {
                            self.btns.push(btn)
                        }
                    })
                }

                this.$watch('src', function () {
                    if (this.src)
                        route.getComponent(this.src, function () {
                            this.content = this.src
                        }.bind(this))
                }.bind(this))
            },

            ready: function () {
            }
        }),

        vm = new Openbox()

    if (opts.show) vm.show()
   
    return vm
}

openbox.confirm = function (message, callback) {
    openbox({
        title: "Confirm",
        show: true,
        width: 6,
        body: message,
        btns: ['ok', 'close'],
        callback: callback
    })
}

module.exports = openbox

});
require.register("vui/src/components/option.js", function(exports, require, module){
var request = require('../request'),
    utils   = require('../utils')

function formatOption(opts) {
    if (!opts) return []
    if (utils.isArray(opts)) return opts

    if ('string' === typeof opts) {
        opts = opts.trim()
        if (opts.charAt(0) !== '{')
             opts = '{' + opts + '}'
        opts = eval('(' + opts + ')')
    }

    return opts
}

function contains(arr, val) {
    var suc = false
    utils.forEach(arr, function (s) {
        if (s == val)
            suc = true
    })
    return suc
}

module.exports = {
    template: require('./option.html'),
    paramAttributes: ['src', 'options', 'inline', 'name'],

    methods: {
        setValue: function (value, e) {
            if (this.type === 'radio')
                this.setRadioValue(e.target, value)
            else
                this.setCheckboxValue(e.target, value)
        },

        setCheckboxValue: function (el, value) {
            if (this.$single) {
                if (el.checked)
                    this.value = value
                else
                    this.value = null
            } else {
                if (el.checked)
                    this.value.push(value)
                else
                    utils.arrayRemove(this.value, value)
            }
        },

        setRadioValue: function (el, value) {
            this.value = value
        },

        check: function (value) {
            var vals = this.value
            if (!vals)
                vals = []
            else if ('string' === typeof vals)
                vals = [vals]

            return utils.contains(value)
        }
    },

    data: {
        options: null
    },

    created: function () {
        var src = this.src

        this.type = this.className = this.$el.getAttribute('type')
        this.name = this.name || utils.nextUid()

        if (utils.toBoolean(this.inline))
            this.className = this.type + '-inline'

        function judge() {
            this.$single = utils.size(this.options) === 1
        }

        if (this.options) {
            this.options = formatOption(this.options)
            judge.call(this)
        } else if (!this.options && src) {
            this.options = {}
            request.get(src).end(function (res) {
                if (res.body instanceof Array) {
                    this.options = formatOption(res.body)
                } else if (res.body.status === 1) {
                    this.options = formatOption(res.body.data)
                }
                //this.options = formatOption(res.body)
                judge.call(this)
            }.bind(this))
        }

        // clear
        utils.forEach(['type', 'src', 'name', 'options'], function (attr) {
            this.$el.removeAttribute(attr)
        }.bind(this))

    },

    ready: function () {
        if (this.type === 'checkbox') {
            if (null === this.value || undefined === this.value)
                this.value = []
            else if ('string' === typeof this.value)
                this.value = this.value.split(',')
        }

        this.$watch('value', function (value, mut) {
            if (this.type === 'radio') {
                this.$el.querySelector('input[value="' + this.value + '"]').checked = true
            } else {
                if (typeof value === 'string') {
                    if (value === '') this.value = []
                    else this.value = this.value.split(',')
                }
                utils.forEach(this.$el.querySelectorAll('input[type="checkbox"]'), function (el) {
                    if (value === null) {
                        el.checked = false
                        return
                    }
                    el.checked = value.toString() === el.value.toString() || contains(value, el.value)
                }.bind(this))
            }
        }.bind(this))
    }
}

});
require.register("vui/src/components/page.js", function(exports, require, module){
var request   = require('../request'),
    utils     = require('../utils'),
    _location = require('../location'),
    route     = require('../route'),
    message   = require('./message'),
    loading   = require('./loading'),
    lang      = require('../lang/lang'),
    openbox   = require('./openbox'),
    forEach   = utils.forEach,
    basepath  = _location.node(true).pathname

function getSearch(pager, filters, sort) {
    var search = {},
        txt = ""

    forEach({p:pager, f:filters, s:sort}, function (obj, pre) {
        if (!obj) return
        pre = pre === 'f' ? 'f.': ''
        forEach(obj, function (v, k) {
            if (undefined !== v && '' !== v) search[pre + k] = v
        })
    })

    txt = utils.toKeyValue(search)
    return {
        obj: search,
        txt: txt ? "?" + txt : ""
    }
}

function routeChange() {
    // 如果路径不等于基础路径，忽略route
    if (_location.node(true).pathname === basepath)
        this.init()
}

// filters ========================================================
var FILTERS = {
    text: '<input class="form-control" placeholder="{text}" v-model="filters.{key}${filter}" />',
    select: '<div class="form-control" src="{src}" style="width:160px" placeholder="{text}" v-component="select" v-with="value:filters.{key}${filter}"></div>',
    bool: '<div class="form-control" src="bool" style="width:60px" placeholder="{text}" v-component="select" v-with="value:filters.{key}${filter}"></div>',
    date: '<div class="form-control date" style="width:140px" placeholder="{text}" v-component="date" v-with="date:filters.{key}${filter}"></div>'
}
function getFilter(struct) {
    struct = struct || []
    var filter = []
    utils.forEach(struct, function (v, i) {
        if (!v.filter) return
        var el = utils.substitute(FILTERS[v.type], v)
        filter.push(el)
    })
    return filter
}

function getStruct(struct) {
    struct = struct || []
    var hs = []
    utils.forEach(struct, function (v, i) {
        if (!v.hide) hs.push(v)
    })
    return hs
}

// buttons =========================================================
var UNIT_OP = {
    "edit": '<a title="{text}" v-href="{op}"><i class="icon icon-edit"></i></a>',
    "del": '<a title="{text}" class="text-danger" href="javascript:;" v-on="click:del(\'{op}\')"><i class="icon icon-trash-o"></i></a>'
}
var MULT_OP = {
    "new": '<a class="btn btn-success" v-href="{op}"><i class="icon icon-plus"></i> {text}</a>',
    "refresh": '<a class="btn btn-info" v-on="click:update"><i class="icon icon-refresh"></i> {text}</a>',
    "del": '<a class="btn btn-danger" title="{text}" class="text-danger" href="javascript:;" v-on="click:delSelect(\'{op}\')"><i class="icon icon-trash-o"></i> {text}</a>',
    "filter": '<a class="btn btn-default" v-if="filterTpl.length>0" href="javascript:;" v-on="click:filterShow=!filterShow"><i v-class="icon-eye:filterShow,icon-eye-slash:!filterShow" class="icon"></i> {text}</a>'
}
function getOp(src, oplist) {
    var ops = [],
        op = '',
        obj
    src = src || {}
    utils.forEach(src, function (v, k) {
        op = oplist[k]
        if (!op) return
        obj = {
            // {{key}} replace {{d.key}}，模板需要用d.key取值
            op: v.replace(/\{\{([^{}]*)\}\}/g, "{{d.$1}}"),
            text: lang.get('button.' + k)
        }
        ops.push(utils.substitute(op, obj))
    })
    return ops.join('&nbsp; ')
}
function getUnitOp(src) {
    return getOp(src, UNIT_OP)
}
function getMultOp(src, filter) {
    var ops = getOp(src, MULT_OP)
    if (filter)
        ops += '&nbsp; ' + utils.substitute(MULT_OP["filter"], { text: lang.get('button.filter') })
    return ops
}

var component = {

    paramAttributes: ['src', 'delay', 'routeChange'],
    methods: {
        search: function (fs) {
            if (fs === null) this.filters = {}
            this.pager.page = 1
            this.update()
        },

        update: function () {
            var self = this,
                search = getSearch(this.pager, this.filters, this.sort),
                url = this.currentUrl = this.src + search.txt

            if (this.routeChange && this.routeChange === 'true')
                _location.search(search.obj)

            loading.start()
            request.get(url).end(function (res) {
                loading.end()
                if (res.status != 200) {
                    message.error('', res.status)
                    return
                }
                self.data = res.body.data
                self.total = res.body.total
            })
        },

        updateModel: function (item) {
            loading.start()
            request.put(this.src).send(item.$data).end(function (res) {
                loading.end()
                if (res.status != 200) {
                    message.error('', res.status)
                    return
                }
                if (res.body.status === 1)
                    message.success(res.body.msg || 'success')
                else
                    message.error(res.body.errors)
            })
        },

        del: function (data) {
            var self = this
            function _del() {
                loading.start()
                request.del(self.src).send(data).end(function (res) {
                    loading.end()
                    if (res.status != 200) {
                        message.error('', res.status)
                        return
                    }
                    if (res.body.status === 1)
                        self.update()
                    else
                        message.error(res.body.errors)
                })
            }
            
            var count = 1
            if ('string' !== typeof data)
                count = data.length
            openbox.confirm(lang.get('page.del_confirm', {count: count}), function (status) {
                if (status) _del()
            })
            
        },

        delSelect: function (keys) {
            keys = keys || 'id'
            if (typeof keys == 'string')
                keys = keys.split(',')

            for (var i=0; i<keys.length; i++) {
                keys[i] = keys[i].trim()
            }
            var data = this.getSelected.apply(this, keys)

            if (data.length === 0)
                message.warn(lang.get('page.must_select'))
            else
                this.del(data)
        },

        selectAll: function () {
            var allChecked = this.allChecked = !this.allChecked
            utils.forEach(this.data, function (d) {
                d.vui_checked = allChecked
            })
        },
        
        select: function (item) {
            item.vui_checked = !item.vui_checked
        },

        getSelected: function () {
            var sd = [],
                args = Array.prototype.slice.call(arguments),
                len = args.length,
                nd = null
            utils.forEach(this.data, function (d) {
                if (!d.vui_checked) return

                if (len === 0)
                    nd = d
                else if (len === 1)
                    nd = d[args[0]]
                else {
                    nd = {}
                    utils.forEach(args, function (v, i) {
                        nd[v] = d[v]
                    })
                }
                
                sd.push(nd)
            })
            return sd
        },


        init: function () {
            var search = utils.parseKeyValue(_location.node(true).search) || {},
                self = this

            this.allChecked = false
            this.pager = {
                page: 1,
                size: 20
            }

            this.button = lang.get('button')
            this.filters = {}
            this.sort = {}
            this.pageable = !(this.$el.getAttribute('pageable') === 'false')
            if (!this.pageable) this.pager = {}

            function setFilter(v, k) {
                if (k.indexOf('f.') !== 0) return
                self.filters[k.slice(2)] = v
            }
            
            forEach(search, function (v, k) {
                switch (k) {
                    case 'page':
                        self.pager.page = parseInt(v)
                        break
                    case 'size':
                        self.pager.size = parseInt(v)
                        break
                    default:
                        setFilter(v, k)
                        break
                }
            })

            try {
                var size = this.$el.getAttribute("size")
                if (size) this.pager.size = parseInt(size)
            } catch (e) {}
        },
        destroy: function () {
            this.$destroy()
        }
    },
    data: {
        data: [],
        filters: {},
        pager: {},
        total: 0,
        sort: {},
        struct: null,
        pageable: false
    },
    created: function () {
        this.init()
        this.colon = _location.node(true).colon

        var struct = this.$el.getAttribute("struct")
        if (struct) {
            struct = utils.format(struct, this.colon)
            loading.start()
            // use sync 
            request.get(struct).end(function (res) {
                loading.end()
                if (res.status !== 200 || res.body.status !== 1) {
                    message.error(res.body.errors, res.status)
                    return
                }

                this.struct = getStruct(res.body.struct)
                this.filterTpl = getFilter(res.body.struct)
                // if struct has src, use struct.src
                if (res.body.src)
                    this.src = res.body.src
                if (res.body.pageable !== undefined)
                    this.pageable = res.body.pageable
                if (res.body.op) {
                    this.unitOp = getUnitOp(res.body.op.unit)
                    this.multOp = getMultOp(res.body.op.mult, this.filterTpl.length>0)
                }
            }.bind(this), true)
        }

        if (this.src) {
            this.src = utils.format(this.src, this.colon)
        }
    },
    ready: function () {
        if (this.routeChange)
            route.bind(routeChange.bind(this))

        if (!this.delay) this.update()

        var form = this.$el.querySelector('form')
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault()
            })
        }
    },
    beforeDestroy: function () {
        if (this.routeChange)
            route.unbind(routeChange.bind(this))
    }
}

var component_struct = utils.copy(component)
component_struct.template = require('./page.html')

module.exports = {
    'page': component,
    'page-struct': component_struct
}

});
require.register("vui/src/components/pagination.js", function(exports, require, module){
module.exports = {
    template: require('./pagination.html'),
    replace: true,
    methods: {
        compose: function () {
            var page = this.page,
                size = this.size,
                max  = this.max = Math.ceil(this.total / size)

            this.pages = []
            for (var i = 1; i <= max; i++) {
                if (i === 1 || i === max || Math.abs(i-page) < 5)
                    this.pages.push(i)
            }

        },
        change: function (page) {
            this.page = page
            this.compose()
            if (this.$parent && this.$parent.update)
                this.$parent.update()
        }
    },
    data: {
        page: 1,
        size: 20,
        total: 0,
        step: 5,
        max: 1,
        pages: []
    },
    created: function () {
        this.compose()
    },
    ready: function () {
        var self = this
        this.$watch('total', function () {
            self.compose()
        })
    }
}

});
require.register("vui/src/components/scope.js", function(exports, require, module){
// 先占个位置
module.exports = {
    methods: {
        set: function (modal) {
            this.modal = modal
        }
    },
    data: {
        modal: {}
    },
    created: function () {
    }
}

});
require.register("vui/src/components/select.js", function(exports, require, module){
var request = require('../request'),
    utils   = require('../utils'),
    lang    = require('../lang/lang'),
    forEach = utils.forEach

module.exports = {
    template: require('./select.html'),
    replace: true,
    paramAttributes: ['src', 'placeholder'],
    methods: {
        open: function () {
            if (this.$open) return
            this.$open = true
            setTimeout(function () {
                utils.addClass(this.$el, 'active')
                document.body.addEventListener('click', this.$closeHandle)
            }.bind(this), 50)
        },
        close: function () {
            if (!this.$open) return
            this.$open = false

            utils.removeClass(this.$el, 'active')
            document.body.removeEventListener('click', this.$closeHandle)
        },
        select: function (item) {
            //this.placeholder = ''
            this.text = item.text
            if (item.value != this.value)
                this.value = item.value
        },
        setValue: function (value) {
            if (undefined === value) {
                this.text = null
            }

            forEach(this.options, function (item) {
                if (value === item.value)
                    this.select(item)
            }.bind(this))
        }
    },
    data: {
        options: []
    },
    created: function () {
        var self = this
        utils.addClass(this.$el, 'select')

        if (this.src === 'bool') {
            this.options = lang.get('boolSelect')
        } else if (this.src) {
            request.get(this.src).end(function (res) {
                if (res.body instanceof Array) {
                    self.options = res.body
                } else if (res.body.status === 1) {
                    self.options = res.body.data
                }
                self.setValue(self.value)
            })
        }

        this.$closeHandle = function () {
            self.close()
        }
    },
    ready: function () {
        var self = this
        self.$watch('value', function () {
            self.setValue(self.value)
        })
    }
}

});
require.register("vui/src/components/tree.js", function(exports, require, module){
var request = require('../request'),
    message = require('./message'),
    utils   = require('../utils')

var index = 1
function getUid() {
    return index++
}

function hasChildren(node) {
    return node.children && node.children.length > 0
}

function initData(data, list, p) {
    list = list || {}
    utils.forEach(data, function (d, i) {
        d.id = d.id || getUid()
        d.$parent = p
        if (d.children && d.children.length > 0) {
            d.$type = 'folder'
            d.children = initData(d.children, list, d.id)
        } else {
            d.$type = 'file'
        }
        list[d.id] = d
        d.vui_status = 0
    })
    return data
}

function initValue(list, values, k) {
    values = values || []
    if (typeof values === 'string')
        values = values.split(',')

    utils.forEach(list, function (d) {
        if (!hasChildren(d) && values.indexOf(d[k]) >= 0) {
            d.vui_status = 2
            setParent(d.$parent, list)
        }
    })
}

function setStatus(node, status) {
    node.vui_status = status
    utils.forEach(node.children, function (d, i) {
        setStatus(d, status)
    })
}

function setParent(p, list) {
    if (p === undefined) return
    var node = list[p]
    var status = 0
    utils.forEach(node.children, function (d) {
        status += d.vui_status
    })
    if (status === 0) {
        node.vui_status = 0
    } else if (status === (node.children.length * 2)) {
        node.vui_status = 2
    } else {
        node.vui_status = 1
    }
    setParent(node.$parent, list)
}

var tree = {
    template: '<ul class="treeview list-unstyled"><li v-repeat="node:data" v-with="list:list, current:current" v-component="tree-{{node.$type}}"></li></ul>',

    replace: true,

    paramAttributes: ['src', 'select', 'selectable'],
    
    data: {
        data: [],
        selectable: false,
        current: null
    },

    methods: {
        getSelected: function (k, full) {
            var status = full ? 1 : 0
            var str = []
            utils.forEach(this.list, function (node) {
                if (node.vui_status > status)
                    str.push(node[k])
            })
            return str.join(',')
        }
    },

    created: function () {
        var self = this
        this.$initialized = false
        this.$first = true
        this.data = []
        this.list = {}
        this.selectable = this.selectable === 'true'
        this.select = this.select || 'id'

        if (this.src) {
            request.get(this.src).end(function (res) {
               if (res.status !== 200) {
                    message.error(null, res.status)
                    return
                }
                if (res.body.status == 1) {
                    self.data = initData(res.body.data, self.list)
                    if (self.value && !self.$initialized) {
                        self.$initialized = true
                        initValue(self.list, self.value, self.select)
                    }

                    self.$watch('data', function () {
                        self.value = self.getSelected(self.select)
                    })
                } else {
                    message.error(res.body.errors)
                } 
            })
        }

    },

    ready: function () {
        // 初始化赋值
        this.$watch('value', function () {
            if (this.$initialized) return
            this.$initialized = true
            initValue(this.list, this.value, this.select)
        }.bind(this))
    }
}

var folder = {
    template:   '<label v-class="active:current==node">\
                    <i class="icon" v-class="icon-minus-square-o:open, icon-plus-square-o:!open" v-on="click:open=!open"></i>\
                    <i v-show="selectable" class="icon" v-on="click:select(node)" v-class="icon-square-o:node.vui_status==0,icon-check-square:node.vui_status==2,icon-check-square-o:node.vui_status==1"></i>\
                    <i class="icon icon-folder-o" v-class="icon-folder-open-o: open"></i>\
                    <span v-on="click:current=node">{{node.text}}</span>\
                </label>\
                <ul class="list-unstyled" v-show="open">\
                    <li v-repeat="node:node.children" v-with="list:list, current:current" v-component="tree-{{node.$type}}"></li>\
                </ul>',

    data: {
        open: false,
        list: {}
    },

    methods: {
        select: function (node) {
            var status = node.vui_status < 2 ? 2 : 0
            setStatus(node, status)
            setParent(node.$parent, this.list)
        }
    }
}

var file = {
    template:   '<label v-class="active:current==node">\
                    <i class="icon icon-file-o"></i>\
                    <i v-show="selectable" v-on="click:select(node)" class="icon icon-square-o" v-class="icon-check-square: node.vui_status==2"></i>\
                    <span v-on="click:current=node">{{node.text}}</span>\
                </label>',

    data: {},

    methods: {
        select: function (node) {
            var status = node.vui_status < 2 ? 2 : 0
            setStatus(node, status)
            setParent(node.$parent, this.list)
        }
    }
}

module.exports = {
    tree:   tree,
    folder: folder,
    file:   file
}

});
require.register("vui/src/filters/icon.js", function(exports, require, module){
module.exports = function (value) {
    if (value === true || value === 'true')
        return '<i class="icon icon-check text-success"></i>'

    if (value === false || value === 'false')
        return '<i class="icon icon-times text-danger"></i>'

    if (value === 'selectall')
        return '<i v-on="click: selectAll" v-class="icon-check-square-o:allChecked, icon-square-o:!allChecked" class="icon"></i>'

    if (value === 'select')
       return '<i v-on="click: select(this)" v-class="icon-check-square-o:vui_checked, icon-square-o:!vui_checked" class="icon"></i>' 
}

});
require.register("vui/src/filters/string.js", function(exports, require, module){
var utils = require('../utils')

module.exports = {
    format: function (value, arr) {
        arr = arr || []
        return utils.format(value, arr)
    }
}

});
require.register("vui/src/lang/lang.js", function(exports, require, module){
var utils = require('../utils')

var vs  = {}

module.exports = {
    get: function (key, obj) {
        var ks  = key.split('.'),
            val = vs
        ks.forEach(function (k, i) {
            if (!val) {
                val = undefined
                return
            }
            val = val[k]
        })
        if (typeof obj === 'object')
            val = utils.substitute(val, obj)
        return val
    },

    set: function (lang) {
        vs = require('./' + lang)
    }
}

});
require.register("vui/src/lang/zh-cn.js", function(exports, require, module){
module.exports = {
    httpStatus: {
        404: '请求的地址不存在',
        500: '内部服务器错误'
    },
    button: {
        filter: '筛选',
        reset: '重置',
        submit: '提交',
        ok: '确定',
        close: '关闭',
        cancel: '取消',
        back: '返回',
        add: '增加',
        new: '新建',
        refresh: '刷新',
        edit: '编辑',
        del: '删除'
    },
    boolSelect: [
        { text: '　', value: '' },
        { text: '是', value: 1 },
        { text: '否', value: 0 }
    ],
    validation: {
        msgs: {
            'require': '不能为空',
            'maxlen': '长度不能大于{_maxlen}',
            'minlen': '长度不能小于{_minlen}',
            'maxlen_cb': '最多选{_maxlen}个选项',
            'minlen_cb': '最少选{_minlen}个选项',
            'max': '不能大于{_max}',
            'min': '不能小于{_min}',
            'regex': '格式不正确',
            'alpha': '只能包含英文字符，"-"，"_"',
            'alphanum': '只能包含数字、英文字符和"_"',
            'tip': '{_tip}'
        },
        tips: {
            'require': '必填',
            'max': '最大值{_max}',
            'min': '最小值{_min}',
            'maxlen': '最大长度{_maxlen}',
            'minlen': '最小长度{_minlen}',
            'maxlen_cb': '最多选{_maxlen}项',
            'minlen_cb': '最少选{_minlen}项'
        }
    },
    page: {
        del_confirm: '是否确定要删除这 {count} 条数据？',
        must_select: '至少选择一条数据'
    }
}

});






require.register("vui/src/components/date.html", function(exports, require, module){
module.exports = '<div v-on="click:open()">\n    <span v-class="hide:!!date" class="placeholder">{{placeholder}}</span>\n    <span class="date-text" v-text="date"></span>\n    <i class="icon icon-calendar"></i>\n    <div class="date-picker" v-class="date-picker-up: pickerUp">\n        <div class="date-picker-header">\n            <a href="javascript:;" class="date-picker-handle pre" v-on="click:change(-1)"><i class="icon icon-chevron-left"></i></a>\n            <a href="javascript:;" v-on="click:statusToggle()" class="date-picker-handle year">{{showDate.year}} 年<span v-show="status == 1"> {{showDate.month + 1}} 月</span></a>\n            <a href="javascript:;" class="date-picker-handle next" v-on="click:change(1)"><i class="icon icon-chevron-right"></i></a>\n        </div>\n        <div class="inner" v-show="status == 1">\n            <div class="week" v-repeat="w:[\'日\', \'一\', \'二\', \'三\', \'四\', \'五\', \'六\']">{{w}}</div>\n            <button type="button" v-on="click:set(day, $event)" v-class="gray: day.month!=showDate.month, today:day.date==currentDate.day && day.month==currentDate.month" class="day" v-repeat="day:days">{{day.date}}</button>\n        </div>\n        <div class="inner" v-show="status == 2">\n            <button type="button" v-on="click:setMonth(month-1)" class="month" v-repeat="month:[1,2,3,4,5,6,7,8,9,10,11,12]"">{{month}}月</button>\n        </div>\n        <div class="inner" v-show="status == 3">\n            <button type="button" v-on="click:setYear(year)" class="year" v-repeat="year:years">{{year}}</button>\n        </div>\n    </div>\n</div> \n';
});
require.register("vui/src/components/form.html", function(exports, require, module){
module.exports = '<form v-show="struct" class="form-horizontal" v-html="content" role="form"></form>\n<content></content>\n';
});
require.register("vui/src/components/form-control.html", function(exports, require, module){
module.exports = '<div v-class="has-error:!valid" class="form-group">\n    <label for="{{id}}" class="col-sm-{{_col[0]}} control-label">{{_label}}</label>\n    <div v-if="_type!==\'empty\'" class="col-sm-{{12-_col[0]}}" v-html="_content"></div>\n    <div v-if="_type===\'empty\'" class="col-sm-{{12-_col[0]}}"><content></content></div>\n</div>\n';
});
require.register("vui/src/components/openbox.html", function(exports, require, module){
module.exports = '<div v-show="$open" class="openbox" v-transition>\n    <div class="openbox-backdrop"></div>\n    <div class="openbox-inner" v-on="click:bgclose">\n        <div class="openbox-content col-md-{{width}}">\n            <a href="script:;" class="close" v-on="click:close(false)">&times;</a>\n            <div class="openbox-header" v-if="title">\n                <h3 v-text="title"></h3>\n            </div>\n            <div class="openbox-body" v-view="content" v-with="src:src, model:model"></div>\n            <div class="openbox-body" v-if="body" v-html="body"></div>\n            <div class="openbox-footer">\n                <button type="button" class="btn btn-{{type}}" v-text="text" v-on="click:fn()" v-repeat="btns"></button>\n            </div>\n        </div>\n    </div>\n</div>\n\n';
});
require.register("vui/src/components/option.html", function(exports, require, module){
module.exports = '<div v-repeat="options" class="{{className}}">\n    <label><input type="{{type}}" v-on="change:setValue($value, $event)" name="{{name}}" value="{{$value}}" /> {{$key}}</label> \n</div>\n';
});
require.register("vui/src/components/page.html", function(exports, require, module){
module.exports = '<div class="page-header">\n    <div class="buttons" v-html="multOp"></div>\n</div>\n<div class="page-content">\n    <form v-show="filterShow" class="form-inline page-filter" v-transition v-on="submit:search">\n        <div v-repeat="f:filterTpl" v-html="f" class="form-group"></div><div class="form-group"><button class="btn btn-primary">{{button.ok}}</button></div><div class="form-group"><button v-on="click:search(null)" type="button" class="btn btn-default">{{button.reset}}</button></div>\n    </form>\n    <table class="table table-hover">\n        <thead>\n            <tr>\n                <th class="check" v-on="click: selectAll"><i v-class="icon-check-square-o:allChecked, icon-square-o:!allChecked" class="icon"></i></th>\n                <th></th>\n                <th v-repeat="h:struct">{{h.text}}</th>\n            </tr>\n        </thead>\n        <tbody>\n            <tr v-repeat="d:data">\n                <td class="check" v-on="click: select(d)"><i v-class="icon-check-square-o:d.vui_checked, icon-square-o:!d.vui_checked" class="icon"></i></td>\n                <td v-html="unitOp"></td>\n                <td v-repeat="h:struct" v-html="d[h.key]"></td>\n            </tr>\n        </body>\n    </table>\n    <div v-if="pageable" v-component="pagination" v-with="page:pager.page, size:pager.size, total:total"></div>\n</div>\n';
});
require.register("vui/src/components/pagination.html", function(exports, require, module){
module.exports = '<div class="pagination-wrapper">\n    <ul class="pagination">\n        <li v-if="page>1"><a href="javascript:;" v-on="click:change(page-1)">«</a></li>\n        <li v-class="active:page==p" v-repeat="p:pages"><a href="javascript:;" v-on="click:change(p)" v-text="p"></a></li>\n        <li v-if="page<max"><a href="javascript:;" v-on="click:change(page+1)">»</a></li>\n    </ul>\n    <div class="pageinfo">{{(page-1) * size + 1}}-{{ (page * size > total) ? total: (page * size) }} / {{total}}</div>\n</div>\n';
});
require.register("vui/src/components/select.html", function(exports, require, module){
module.exports = '<div v-on="click:open()">\n    <div class="inner"><span v-class="hide:!!text" class="placeholder">{{placeholder}}</span>{{text}}</div>\n    <ul class="dropdown-menu"><li v-on="click:select(d)" v-repeat="d:options"><a ng-class="{\'active\':d.$selected}" href="javascript:;">{{d.text}}</a></li></ul>\n    <b class="caret"></b>\n</div>\n';
});
require.alias("yyx990803-vue/src/main.js", "vui/deps/vue/src/main.js");
require.alias("yyx990803-vue/src/emitter.js", "vui/deps/vue/src/emitter.js");
require.alias("yyx990803-vue/src/config.js", "vui/deps/vue/src/config.js");
require.alias("yyx990803-vue/src/utils.js", "vui/deps/vue/src/utils.js");
require.alias("yyx990803-vue/src/fragment.js", "vui/deps/vue/src/fragment.js");
require.alias("yyx990803-vue/src/compiler.js", "vui/deps/vue/src/compiler.js");
require.alias("yyx990803-vue/src/viewmodel.js", "vui/deps/vue/src/viewmodel.js");
require.alias("yyx990803-vue/src/binding.js", "vui/deps/vue/src/binding.js");
require.alias("yyx990803-vue/src/observer.js", "vui/deps/vue/src/observer.js");
require.alias("yyx990803-vue/src/directive.js", "vui/deps/vue/src/directive.js");
require.alias("yyx990803-vue/src/exp-parser.js", "vui/deps/vue/src/exp-parser.js");
require.alias("yyx990803-vue/src/template-parser.js", "vui/deps/vue/src/template-parser.js");
require.alias("yyx990803-vue/src/text-parser.js", "vui/deps/vue/src/text-parser.js");
require.alias("yyx990803-vue/src/deps-parser.js", "vui/deps/vue/src/deps-parser.js");
require.alias("yyx990803-vue/src/filters.js", "vui/deps/vue/src/filters.js");
require.alias("yyx990803-vue/src/transition.js", "vui/deps/vue/src/transition.js");
require.alias("yyx990803-vue/src/batcher.js", "vui/deps/vue/src/batcher.js");
require.alias("yyx990803-vue/src/directives/index.js", "vui/deps/vue/src/directives/index.js");
require.alias("yyx990803-vue/src/directives/if.js", "vui/deps/vue/src/directives/if.js");
require.alias("yyx990803-vue/src/directives/repeat.js", "vui/deps/vue/src/directives/repeat.js");
require.alias("yyx990803-vue/src/directives/on.js", "vui/deps/vue/src/directives/on.js");
require.alias("yyx990803-vue/src/directives/model.js", "vui/deps/vue/src/directives/model.js");
require.alias("yyx990803-vue/src/directives/with.js", "vui/deps/vue/src/directives/with.js");
require.alias("yyx990803-vue/src/directives/html.js", "vui/deps/vue/src/directives/html.js");
require.alias("yyx990803-vue/src/directives/style.js", "vui/deps/vue/src/directives/style.js");
require.alias("yyx990803-vue/src/directives/partial.js", "vui/deps/vue/src/directives/partial.js");
require.alias("yyx990803-vue/src/directives/view.js", "vui/deps/vue/src/directives/view.js");
require.alias("yyx990803-vue/src/main.js", "vui/deps/vue/index.js");
require.alias("yyx990803-vue/src/main.js", "vue/index.js");
require.alias("yyx990803-vue/src/main.js", "yyx990803-vue/index.js");
require.alias("smtc-superagent/lib/client.js", "vui/deps/superagent/lib/client.js");
require.alias("smtc-superagent/lib/client.js", "vui/deps/superagent/index.js");
require.alias("smtc-superagent/lib/client.js", "superagent/index.js");
require.alias("component-emitter/index.js", "smtc-superagent/deps/emitter/index.js");

require.alias("component-reduce/index.js", "smtc-superagent/deps/reduce/index.js");

require.alias("smtc-superagent/lib/client.js", "smtc-superagent/index.js");
require.alias("vui/src/main.js", "vui/index.js");
if (typeof exports == 'object') {
  module.exports = require('vui');
} else if (typeof define == 'function' && define.amd) {
  define(function(){ return require('vui'); });
} else {
  window['vui'] = require('vui');
}})();