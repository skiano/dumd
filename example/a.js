(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('a', ['exports', 'b', 'c'], factory);
  } else {
    factory(exports, require('b'), require('c'));
  }
}(typeof self !== 'undefined' ? self : this, function (exports, b, c) {
    c.insertContent('hello')
    b.insertPrefixedContent('hello')
}));