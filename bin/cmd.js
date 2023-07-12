#!/usr/bin/env node

var argv = require('yargs')
    .demand(1)
    .alias('o', 'output')
    .describe('o', 'output file')
    .alias('s', 'spread')
    .describe('s', 'distance spread amount, default 1')
    .alias('d', 'downscale')
    .describe('d', 'amount to downscale the output, default 1')
    .alias('a', 'alphaonly')
    .describe('a', 'Alpha only, if 1 then only look at alpha not RGB. default 0')
    .alias('x', 'gridwidth')
    .describe('x', 'Grid cell width in px. If present, SDFs will be generated within grid cells. default -1')
    .alias('y', 'gridheight')
    .describe('y', 'Grid cell height in px. If present, SDFs will be generated within grid cells. default -1')
    .alias('c', 'color')
    .describe('c', 'output color, accepts css strings. If it is "S" then it will use the same color replacing alpha, default #fff')
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
var rgb = [0xff, 0xff, 0xff]
if (argv.c) {
    if (argv.c != "S")
        rgb = getRgb(argv.c.trim())
    else rgb = "S"
}

read(input, function(err, pixels) {
    if (err)
        throw err
    var dims = {x: argv.x ?? -1, y: argv.y ?? -1}
    var sdf = generate(pixels, { spread: argv.s, downscale: argv.d, color: rgb, exclude: argv.a, grid:dims })
    save(sdf, 'png').pipe(output)
})