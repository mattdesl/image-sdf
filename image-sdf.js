var ndarray = require('ndarray')
var compute = require('./')

module.exports = function(array, opt) {
    var { output_distances , output_closest_colors } = compute(array, opt)
    var color = opt.color || [0xff, 0xff, 0xff] 
    var useTrueColor = opt.color === "S"

    var width = output_distances.shape[0],
        height = output_distances.shape[1]
    var result = new Uint8ClampedArray(width*height*4)
    var output = ndarray(result, [width, height, 4])
    for (var i=0; i<width*height; i++) {
        var x = i % width,
            y = ~~( i / width )
        var a = output_distances.get(x, y, 0)
        var idx = output.index(x, y, 0)
        if (useTrueColor) {
            result[idx+0] = output_closest_colors.get(x,y,0)
            result[idx+1] = output_closest_colors.get(x,y,1)
            result[idx+2] = output_closest_colors.get(x,y,2)
        }
        else {
            result[idx+0] = color[0]
            result[idx+1] = color[1]
            result[idx+2] = color[2]
        }
        result[idx+3] = a
    }
    return output
}