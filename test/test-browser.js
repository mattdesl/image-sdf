var imageSdf = require('../image-sdf')
var test = require('tape').test
var baboon = require('baboon-image-uri')
var load = require('img')
var getPixels = require('get-image-pixels')
var ndarray = require('ndarray')

load('test/img.png', function(err, img) {
    if (err)
        throw err
    document.body.style.background = '#1d1d1d'

    var px = getPixels(img)
    var array = ndarray(px, [img.width, img.height, 4])

    var result = imageSdf(array, { spread: 10, downscale: 1 })

    var ctx = require('2d-context')({ 
        width: result.shape[0],
        height: result.shape[1] 
    })

    var imgData = ctx.createImageData(result.shape[0], result.shape[1])
    imgData.data.set(result.data)
    ctx.putImageData(imgData, 0, 0)
    document.body.appendChild(img)
    document.body.appendChild(ctx.canvas)
})