# dumd

`dumd` helps ensure that a set of umd/amd javascripts execute in proper order. It doesn’t have the overhead of a full featured amd loader or the sophistication of webpack loader or systemjs, but if all you want to do is use async script tags with umd bundles, this may help.

As a result it can be tiny, about [600 bytes](https://github.com/skiano/dumd/blob/master/dumd.min.js) (about 370B gzipped)

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

If you are using webpack code splitting or something similar, this is probably not for you. But on some projects I find it easier to reason about my code by organizing it into chunks myself and bundling each chunk explicitly as a umd bundle using rollup. Fore example, shared things go in one bundle and features for certain pages go into their own bundles. I prefer the clarity of this to automagical code splitting. (TODO: create example of build)

### what it does

`dumd` creates a global `define` function that pretends to be an `amd` loader. It then waits for any umd or amd scripts to load on the page and only executes them if and when all their dependencies are also loaded. It’s a bit like `require` but with a much more minimal feature set.

[See a live example](https://skiano.github.io/dumd)
(tip: hard refresh the page to see the effect of async scripts in the network tab)

### known caveats

Of the [magic modules](https://github.com/requirejs/requirejs/wiki/differences-between-the-simplified-commonjs-wrapper-and-standard-amd-define#magic), only `exports` is supported because it is used so extensively in packages bundled by babel. If I run into the other two I will attempt to support them.

Circular dependencies are not tested and are likely to fail.

This does not help with loading modules dynamically.

### usage

The dumd snippet should be injected into your page as an inline script. To make this easy,
you can require `dumd` in node and it will export a string with the mangled javascript.

```javascript
const dumdSnippet = require('dumd')
console.log(`<script>${dumdSnippet}</script>`)
```

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
