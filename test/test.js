var execSpawn = require('npm-execspawn')
var test = require('tape')
var fs = require('fs')
var path = require('path')
var concat = require('concat-stream')
var bufferEqual = require('buffer-equal')

var cliPath = path.resolve(__dirname, '..', 'bin', 'cmd.js')

test("should create expected image", function(t) {
    t.plan(1)
    
    var args = ['img.png', '--spread', '10', '--downscale', '1']
    var proc = execSpawn(cliPath + ' ' + args.join(' '), [], { cwd: __dirname })
    proc.stdout.pipe(concat(function(result) {
        fs.readFile(path.join(__dirname, 'img-expected.png'), function(err, data) {
            if (err) t.fail(err)
            t.ok(bufferEqual(result, data), 'buffers match')
        })
    }))
})