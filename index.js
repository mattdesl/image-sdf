var ndarray = require('ndarray')
var pool = require('typedarray-pool')
var clamp = require('clamp')
var number = require('as-number')
var stride = 4

module.exports = function sdf(array, opt) {
    var spread = number(opt && opt.spread, 1)
    var downscale = number(opt && opt.downscale, 1)
    var excludeRGB = number(opt && opt.exclude, 0)
    var grid = opt.grid
    
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

        var bit = inside(array, x, y, excludeRGB) ? 0xff : 0x00
        bitmap.set(x, y, 0, bit)
    }

    var outWidth = Math.floor(width / downscale)
    var outHeight = Math.floor(height / downscale)

    var dist_data = new Uint8ClampedArray(outWidth*outHeight)
    var output_distances = ndarray(dist_data, [outWidth, outHeight, 1])
    var color_data = new Uint8ClampedArray(outWidth*outHeight*3)
    var output_closest_colors = ndarray(color_data, [outWidth, outHeight, 3])
    compute(output_distances, output_closest_colors, bitmap, array, width, height, spread, downscale, grid)

    pool.free(scratch)
    return { output_distances, output_closest_colors }
}

function compute(output, closest_color_output, bitmap, pixels, width, height, spread, downscale, grid) {
    var outWidth = output.shape[0]
    var outHeight = output.shape[1]

    for (var y = 0; y < outHeight; ++y) {
        for (var x = 0; x < outWidth; ++x) {
            var centerX = Math.floor(x * downscale + downscale / 2)
            var centerY = Math.floor(y * downscale + downscale / 2)

            var { signedDistance, closest} = findSignedDistance(bitmap,
                                    width, height,
                                    centerX, centerY, spread,
                                    grid)
            
            var alpha = 0.5 + 0.5 * (signedDistance / spread)
            alpha = Math.floor(clamp(alpha, 0, 1) * 0xff)
            output.set(x, y, 0, alpha)

            var pixIdx = pixels.index(closest.x, closest.y, 0)
            closest_color_output.set(x,y,0, pixels.data[pixIdx+0])
            closest_color_output.set(x,y,1, pixels.data[pixIdx+1])
            closest_color_output.set(x,y,2, pixels.data[pixIdx+2])
        }
    }
}

function getCell(x, y, grid) {
    if (grid.x > 0) x = Math.floor(x / grid.x)
    if (grid.y > 0) y = Math.floor(y / grid.y)
    return { x, y }
}
function findSignedDistance(bitmap, width, height, centerX, centerY, spread, grid) {
    var base = bitmap.get(centerX, centerY, 0)
    var cell = { x: 0, y: 0, w: width-1, h: height-1}
    if (grid.x > 0) {
        cell.x = Math.floor(centerX / grid.x)
        cell.w = Math.min(cell.w, (cell.x + 1)*grid.x)
        cell.x *= grid.x
    }
    if (grid.y > 0) {
        cell.y = Math.floor(centerY / grid.y)
        cell.h = Math.min(cell.h, (cell.y + 1) * grid.y)
        cell.y *= grid.y
    }
    
    var delta = Math.ceil(spread)
    var startX = Math.max(cell.x, centerX - delta)
    var endX  = Math.min(cell.w, centerX + delta)
    var startY = Math.max(cell.y, centerY - delta)
    var endY = Math.min(cell.h, centerY + delta)

    var closestSquareDist = delta * delta
    var closestCoord = {x:centerX, y:centerY}

    for (var y = startY; y <= endY; ++y) {
        for (var x = startX; x <= endX; ++x) {
            if (base !== bitmap.get(x, y, 0)) {
                var sqDist = squareDist(centerX, centerY, x, y)
                if (sqDist < closestSquareDist) {
                    closestSquareDist = sqDist
                    if (!base) {
                        closestCoord = {x,y}
                    }
                }
            }
        }
    }
    
    var closestDist = Math.sqrt(closestSquareDist)
    var out = (base===0xff ? 1 : -1) * Math.min(closestDist, spread)
    return {signedDistance:out, closest:closestCoord}
}

function squareDist(x1, y1, x2, y2) {
    var dx = x1 - x2
    var dy = y1 - y2
    return dx*dx + dy*dy
}

function inside(array, x, y, excludeRGB) {
    var idx = array.index(x, y, 0)
    var data = array.data
    var t = 128
    return data[idx+3]>t && 
        (excludeRGB>0 || data[idx+0]>t || data[idx+1]>t || data[idx+2]>t)
}
