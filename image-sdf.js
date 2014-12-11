var ndarray = require('ndarray')
var compute = require('./')

module.exports = function(array, opt) {
    var alpha = compute(array, opt)
    var color = opt.color || [0xff, 0xff, 0xff]

    var width = alpha.shape[0],
        height = alpha.shape[1]
    var result = new Uint8ClampedArray(width*height*4)
    var output = ndarray(result, [width, height, 4])
    for (var i=0; i<width*height; i++) {
        var x = i % width,
            y = ~~( i / width )
        var a = alpha.get(x, y, 0)
        var idx = output.index(x, y, 0)
        result[idx+0] = color[0]
        result[idx+1] = color[1]
        result[idx+2] = color[2]
        result[idx+3] = a
    }
    return output
}