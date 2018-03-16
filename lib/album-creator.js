const fs = require('fs');
const Jimp = require("jimp");

class AlbumCreator {

	constructor(options, done) {
		options = options || {};
		done = done || function() {};

		this.logo = null;
		this.fileList = [];
		this.settings = {
			logoPaht:	options.logo		|| '',
			albumName:	options.album		|| 'album',
			source:		options.source		|| './',
			filter:		options.filter		|| /\.png$|\.jpg$/,
			thumbSize:	options.thumbSize	|| 128
		};

		if (this.settings.logoPaht) {
			this.loadLogo(this.settings.logoPaht, done);
		} else {
			done();
		}
	}

	loadLogo(logoPaht, done) {
		logoPaht = logoPaht || this.settings.logoPaht;
		done = done || function() {};

		Jimp.read(logoPaht)
			.then((_logo) => { this.logo = _logo; done(); })
			.catch((err) => console.error(err));
	}

	getFiles(source, filter) {
		source = source || this.settings.source;
		filter = filter || this.settings.filter;
		let fileList = this.fileList;

		fs.readdirSync(source).forEach(fileName => {
			if(filter.test(fileName)) { fileList.push(fileName); }
		});
	}

	action(album, name) {
		album = album || this.settings.albumName;
		let self = this;

		Jimp.read(name)
			.then(img => {
				self.makeThumb( img.clone(), album, name );
				img.quality(90)
					.scaleToFit(1920, 1080)
				if (self.logo) { self.addWatermark(img, 'br'); }
				img.write(album + '/' + name);
			})
	}

	addWatermark(img, location) {
		let w = img.bitmap.width;
		let h = img.bitmap.height;
		let lw = this.logo.bitmap.width;
		let lh = this.logo.bitmap.height;
		let x = 0, y = 0;

		switch(location) {
			case 'tr': x = w - lw; break;
			case 'bl': y = h - lh; break;
			case 'br': x = w - lw; y = h - lh; break;
		}

		img.composite(this.logo, x, y);
	}

	makeThumb(img, album, name) {
		img
			.cover(this.settings.thumbSize, this.settings.thumbSize)
			.quality(90)
			.write(album + '/thumb/' + name);
	}

	makeAlbum(album, source, filter) {
		let self = this;
		this.getFiles(source, filter);
		this.fileList.forEach(name => self.action(album, name));
	}
}

module.exports = AlbumCreator;