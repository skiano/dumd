(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('b', ['exports', 'c'], factory);
  } else {
    factory((root.commonJsStrict = {}), root.c);
  }
}(typeof self !== 'undefined' ? self : this, function (exports, c) {
    exports.insertPrefixedContent = function (content) {
      c.insertContent(`prefixed - ${content}`)
    };
}));