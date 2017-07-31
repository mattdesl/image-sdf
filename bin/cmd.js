#!/usr/bin/env node

var argv = require('yargs')
    .demand(1)
    .alias('o', 'output')
    .describe('o', 'output file')
    .alias('s', 'spread')
    .describe('s', 'distance spread amount, default 1')
    .alias('d', 'downscale')
    .describe('d', 'amount to downscale the output, default 1')
    .alias('t', 'threshold')
    .describe('t', 'threshold for the bitmask, default 128')
    .alias('c', 'color')
    .describe('c', 'output color, accepts css strings, default #fff')
    .help('h')
    .usage('image-sdf input.png [opt] > output.png')
    .argv

var getRgb = require('color-string').getRgb
var fs = require('fs')
var read = require('get-pixels')
var save = require('save-pixels')
var generate = require('../image-sdf')

var output = argv.o ? fs.createWriteStream(argv.o) : process.stdout
var input = argv._[0]
var rgb = argv.c ? getRgb(argv.c.trim()) : [0xff, 0xff, 0xff]

read(input, function(err, pixels) {
    if (err)
        throw err
    var sdf = generate(pixels, {
      spread: argv.s,
      downscale: argv.d,
      threshold: argv.t,
      color: rgb
    })
    save(sdf, 'png').pipe(output)
})