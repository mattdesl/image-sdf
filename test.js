var imageSdf = require('./image-sdf')
var test = require('tape').test
var baboon = require('baboon-image-uri')
var load = require('img')
var getPixels = require('get-image-pixels')
var ndarray = require('ndarray')

test("generates a signed distance field from RGBA pixels", function(t) {
    document.body.style.background = '#1d1d1d'
    var img = load('lato.png', function(err, img) {
        var px = getPixels(img)
        var array = ndarray(px, [img.width, img.height, 4])

        var result = imageSdf(array, { spread: 10, downscale: 2 })

        var cnv = document.createElement('canvas')
        var ctx = cnv.getContext('2d')
        cnv.width = result.shape[0]
        cnv.height = result.shape[1]

        var imgData = ctx.createImageData(result.shape[0], result.shape[1])
        imgData.data.set(result.data)
        ctx.putImageData(imgData, 0, 0)
        document.body.appendChild(cnv)
    })
    t.end()
})
