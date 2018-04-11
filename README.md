# dumd

`dumd` helps ensure that a set of umd/amd javascripts execute in proper order. It doesn’t have the overhead of a true amd loader or the sophistication of webpack loader or systemjs, but if all you want to do is use async script tags with umd bundles, this may help.

As a result it can be tiny (about [600 bytes](https://github.com/skiano/dumd/blob/master/dumd.min.js) minified before gzip)

And you can do something like the following:

```html
<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <script type="text/javascript">
      /* dumd snippet goes here to ensure that everything instantiates in order */
    </script>
    <script async="true" type="text/javascript" src="b-needs-a.js"></script>
    <script async="true" type="text/javascript" src="c-needs-a-and-b.js"></script>
    <script async="true" type="text/javascript" src="a.js"></script>
  </body>
</html>
```

### why

Sometimes I know exactly what modules I want on my page, and all I want is for them to load asynchronously and instantiate in the correct order. If they none of them are inline, I can sort of achieve this with `defered` attributes. However, deferred is not gaurenteed to work some inlined scripts depend on non-inlined scripts.

### usage

You can import the actual javascript with:

```javascript
const dumd = require('dumd')
```

But you can also import a module that exports the javascript as a string, which is useful for rendering into templates:

```javascript
const dumdSnippet = require('dumd')
console.log(`<script>${dumdSnippet}</script>`
```

### what it does

`dumd` creates a global `define` function that pretends to be an `amd` loader. It then waits for any umd or amd scripts to load on the page and only executes them if and when all their dependencies are also loaded.

### known caveats

Of the [magic modules](https://github.com/requirejs/requirejs/wiki/differences-between-the-simplified-commonjs-wrapper-and-standard-amd-define#magic), only `exports` is supported because it is used so extensively in packages bundled by babel. If I run into the other two I will attempt to support them.

Circular dependencies are not tested and are likely to fail.

----

### what about umd bundles without ids

Many third party components or builds either do not include an amd module id in their build, or they define a strange id that does not relate to their npm package name.

To help with this `dumd` provides a tool that can take a string of code and inject ids into any umd modules it finds if they are not there or replacing them if they are.

You can use it like so:

```javascript
const defineIds = require('umd/tools/defineIds')
defineIds(code, ids)
```

Where `code` is a string and `ids` is either a single id or a list of ids to be used in order.

So for example:

```javascript
const defineIds = require('umd/tools/defineIds')

// given some code
const someCode = `
  // simplified react bundle
  (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.React = factory());
  }(this, (function () {     
  })));

  // simplified react-dom bundle
  (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react')) :
    typeof define === 'function' && define.amd ? define(['react'], factory) :
    (global.ReactDOM = factory(global.React));
  }(this, (function (React) {
  })));
`

const codeWithIds = defineIds(someCode, ['react', 'react-dom'])

expect(codeWithIds).toEqual(`
  // simplified react bundle
  (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define('react', factory) :
    (global.React = factory());
  }(this, (function () {     
  })));

  // simplified react-dom bundle
  (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react')) :
    typeof define === 'function' && define.amd ? define('react-dom', ['react'], factory) :
    (global.ReactDOM = factory(global.React));
  }(this, (function (React) {
  })));
`)
```
