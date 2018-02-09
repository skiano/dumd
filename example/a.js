(function (root, factory) {
  console.log('load: a')
  if (typeof define === 'function' && define.amd) {
    define('a', ['exports', 'b', 'c'], factory);
  } else {
    factory(exports, require('b'), require('c'));
  }
}(typeof self !== 'undefined' ? self : this, function (exports, b, c) {
    c.insertContent('Module A uses module C')
    b.insertPrefixedContent('Module A uses module B, which uses C')
}));