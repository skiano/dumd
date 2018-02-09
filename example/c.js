(function (root, factory) {
    console.log('load: c')
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define('c', factory);
    } else {
      factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    const elm = document.getElementById('content')
    return {
      insertContent(content) {
        const p = document.createElement('p')
        p.appendChild(document.createTextNode(content))
        elm.appendChild(p);
      }
    }
}));