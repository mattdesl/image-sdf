# image-sdf

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

Command-line tool which takes a 4-channel RGBA image and generates a signed distance field. The bitmask is determined by pixels with alpha over 128 and any RGB channel over 128.

![img1](http://i.imgur.com/36wtCMa.png)

```sh
# install the tool
npm install image-sdf -g

# apply the effect on an image
# and pipe it to a new file
image-sdf atlas.png --spread 32 --downscale 2 > atlas-sdf.png
```

The code has been adpated from [libgdx](https://github.com/libgdx/libgdx/blob/master/extensions/gdx-tools/src/com/badlogic/gdx/tools/distancefield/DistanceFieldGenerator.java).

PRs welcome. This could be split into more modules (generating a bit mask, computing SDF, better image support, etc).

## Usage

[![NPM](https://nodei.co/npm/image-sdf.png)](https://nodei.co/npm/image-sdf/)

```
image-sdf input.png [opt]

Options:
  -o, --output     output file                                    
  -s, --spread     distance spread amount, default 1              
  -d, --downscale  amount to downscale the output, default 1      
  -t, --threshold  threshold for the bitmask, default 128         
  -c, --color      output color, accepts css strings, default #fff
  -h               Show help                                      
```

Examples:

```
image-sdf input.png -c "rgb(128,255,20)" -s 10 -o output.png
image-sdf input.png --spread 2 --downscale 2 > output.png
image-sdf input.png --color black -o build/output.png
```

The programmatic API may evolve into their own modules, i.e. for custom bitmasks.

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/image-sdf/blob/master/LICENSE.md) for details.
