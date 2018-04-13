const fs = require('fs')
const path = require('path')

const input = path.resolve(__dirname,'..','dumd.min.js')
const output = path.resolve(__dirname,'..','dumd.snippet.js')

const code = fs.readFileSync(input).toString()
const snippet = `module.exports='${code.trim()}'`

fs.writeFileSync(output, snippet)
