var ndarray = require('ndarray')
var pool = require('typedarray-pool')
var clamp = require('clamp')
var number = require('as-number')
var stride = 4

module.exports = function sdf(array, opt) {
    var spread = number(opt && opt.spread, 1)
    var downscale = number(opt && opt.downscale, 1)
    var threshold = number(opt && opt.threshold, 128)

    var width = array.shape[0],
        height = array.shape[1]

    // var height = pixels.length/stride/width
    var scratch = pool.mallocUint8(width*height)
    var bitmap = ndarray(scratch, [width, height, 1])

    var x, y

    //get our bitmask, the "on / off" of the image
    for (var i=0; i<width*height; i++) {
        x = i % width
        y = ~~( i / width )
        var idx = array.index(x, y, 0)

        var bit = inside(array, x, y, threshold) ? 0xff : 0x00
        bitmap.set(x, y, 0, bit)
    }

    var outWidth = Math.floor(width / downscale)
    var outHeight = Math.floor(height / downscale)

    var data = new Uint8ClampedArray(outWidth*outHeight)
    var output = ndarray(data, [outWidth, outHeight, 1])
    compute(output, bitmap, width, height, spread, downscale)

    pool.free(scratch)
    return output
}

function compute(output, bitmap, width, height, spread, downscale) {
    var outWidth = output.shape[0]
    var outHeight = output.shape[1]

    for (var y = 0; y < outHeight; ++y) {
        for (var x = 0; x < outWidth; ++x) {
            var centerX = Math.floor(x * downscale + downscale / 2)
            var centerY = Math.floor(y * downscale + downscale / 2)

            var signedDistance = findSignedDistance(bitmap, 
                                    width, height,
                                    centerX, centerY, spread)
            
            var alpha = 0.5 + 0.5 * (signedDistance / spread)
            alpha = Math.floor(clamp(alpha, 0, 1) * 0xff)
            output.set(x, y, 0, alpha)
        }
    }
}

function findSignedDistance(bitmap, width, height, centerX, centerY, spread) {   
    var base = bitmap.get(centerX, centerY, 0)
    
    var delta = Math.ceil(spread)
    var startX = Math.max(0, centerX - delta)
    var endX  = Math.min(width - 1, centerX + delta)
    var startY = Math.max(0, centerY - delta)
    var endY = Math.min(height - 1, centerY + delta)

    var closestSquareDist = delta * delta

    for (var y = startY; y <= endY; ++y) {
        for (var x = startX; x <= endX; ++x) {
            if (base !== bitmap.get(x, y, 0)) {
                var sqDist = squareDist(centerX, centerY, x, y)
                if (sqDist < closestSquareDist) {
                    closestSquareDist = sqDist
                }
            }
        }
    }
    
    var closestDist = Math.sqrt(closestSquareDist)
    return (base===0xff ? 1 : -1) * Math.min(closestDist, spread)
}

function squareDist(x1, y1, x2, y2) {
    var dx = x1 - x2
    var dy = y1 - y2
    return dx*dx + dy*dy
}

function inside(array, x, y, threshold) {
    var idx = array.index(x, y, 0)
    var data = array.data
    var t = threshold
    return data[idx+3]>t &&
        (data[idx+0]>t || data[idx+1]>t || data[idx+2]>t)
}
