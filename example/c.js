(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define('c', factory);
    } else {
      factory(exports);
    }
}(typeof self !== 'undefined' ? self : this, function (exports) {
    console.log('module c is ready')
    const elm = document.getElementById('content')
    return {
      insertContent(content) {
        const p = document.createElement('p')
        p.appendChild(document.createTextNode(content))
        elm.appendChild(p);
      }
    }
}));