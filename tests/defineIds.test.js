const test = require('tape')
const defineIds = require('../tools/defineIds')
const deIndent = require('de-indent')

const examples = [
  {
    title: 'multiple with dependants',
    ids: ['my-react', 'my-react-dom'],
    input: `
      (function (global, factory) {
      typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
      typeof define === 'function' && define.amd ? define(factory) :
      (global.React = factory());
      }(this, (function () { 'use strict';
      })));
      (function (global, factory) {
      typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react')) :
      typeof define === 'function' && define.amd ? define(['react'], factory) :
      (global.ReactDOM = factory(global.React));
      }(this, (function (React) { 'use strict';
      })));
    `,
    output: `
      (function (global, factory) {
      typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
      typeof define === 'function' && define.amd ? define("my-react", factory) :
      (global.React = factory());
      }(this, (function () { 'use strict';
      })));
      (function (global, factory) {
      typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react')) :
      typeof define === 'function' && define.amd ? define("my-react-dom", ['react'], factory) :
      (global.ReactDOM = factory(global.React));
      }(this, (function (React) { 'use strict';
      })));
    `
  },
  {
    title: 'replacing existing id in uglified content',
    ids: 'my-classnames',
    input: `
      !function(){"use strict";"undefined"!=typeof module&&module.exports?module.exports=n:"function"==typeof define&&"object"==typeof define.amd&&define.amd?define("classnames",[],function(){return n}):window.classNames=n}();
    `,
    output: `
      !function(){"use strict";"undefined"!=typeof module&&module.exports?module.exports=n:"function"==typeof define&&"object"==typeof define.amd&&define.amd?define("my-classnames",[],function(){return n}):window.classNames=n}();
    `
  },
  {
    title: `multiple minified with magic modules`,
    ids: ['my-redux', 'my-reselect'],
    input: `
      !function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e(t.Redux=t.Redux||{})}(this,function(t){});
      !function(e,r){if("function"==typeof define&&define.amd)define("Reselect",["exports"],r);else if("undefined"!=typeof exports)r(exports);else{var t={};r(t),e.Reselect=t}}(this,function(t){});
    `,
    output: `
      !function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define("my-redux", ["exports"], e):e(t.Redux=t.Redux||{})}(this,function(t){});
      !function(e,r){if("function"==typeof define&&define.amd)define("my-reselect",["exports"],r);else if("undefined"!=typeof exports)r(exports);else{var t={};r(t),e.Reselect=t}}(this,function(t){});
    `
  }
]

test('id substitution', function (t) {
  t.plan(examples.length)

  examples.forEach(({ title, ids, input, output }) => {
    t.equal(
      deIndent(defineIds(input, ids)),
      deIndent(output),
      title
    )
  })
})

test('ids fail', function (t) {
  t.plan(2)

  try {
    defineIds(`
      (function (global, factory) {
      typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
      typeof define === 'function' && define.amd ? define("my-react", factory) :
      (global.React = factory());
      }(this, (function () { 'use strict';
      })));
      (function (global, factory) {
      typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react')) :
      typeof define === 'function' && define.amd ? define("my-react-dom", ['react'], factory) :
      (global.ReactDOM = factory(global.React));
      }(this, (function (React) { 'use strict';
      })));
    `, ['abc'])
  } catch (e) {
    t.equal(
      deIndent(`\n${e.message}`),
      deIndent(`
        ran out of ids for:

        typeof define === 'function' && define.amd ? define("my-react-dom", ['react'], factory) :
        (global.ReactDOM = factory(global.React))
      `
    ), 'throws for too few ids')
  }

  try {
    defineIds(`
      (function (global, factory) {
      typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
      typeof define === 'function' && define.amd ? define("my-react", factory) :
      (global.React = factory());
      }(this, (function () { 'use strict';
      })));
      (function (global, factory) {
      typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react')) :
      typeof define === 'function' && define.amd ? define("my-react-dom", ['react'], factory) :
      (global.ReactDOM = factory(global.React));
      }(this, (function (React) { 'use strict';
      })));
    `, ['abc', '123', 'extra'])
  } catch (e) {
    t.equal(
      deIndent(`\n${e.message}`),
      deIndent(`\nunused ids: extra`
    ), 'throws for too many ids')
  }
})
