# AlbumCreator
Get all images from source folder and make thumbs, copy in many different size and embed watermark. Image processing is based on Jimp (https://github.com/oliver-moran/jimp)/

## Install

```sh
npm install album-creator
```

## Usage form command line

Install as a global module

```sh
npm install -g album-creator
```

and you can use with `albumcreator` command

```sh
albumcreator -s my-album-settings.json
```

If you still want to use locally, then use `node_modules/.bin/albumcreator` instead

## Usage

```js
const AlbumCreator = require('album-creator');

const settings = {
  dest: "new-album",
  source: "./original",
  filter: "png jpg jpeg",
  thumb: {
    subfolder: "thumb",
    size: 128,
    quality: 70
  },
  watermark: {
    path: "logo.png",
    position: "bottom right",
    opacity: 0.5
  },
  sizes: [
    {
      subfolder: "large",
      width: 1920,
      height: 1080,
      quality: 90
    },
    {
      subfolder: "small",
      width: 480,
      height: 480,
      quality: 70
    }
  ]
};

AlbumCreator( settings );
```