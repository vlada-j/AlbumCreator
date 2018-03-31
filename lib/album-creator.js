const fs = require('fs');
const Jimp = require("jimp");


const DEFAULT_SETTINGS =  {
	dest: 'new-album',
	source: './original',
	filter: 'png jpg jpeg',
	thumb: {
		subfolder: 'thumb',
		size: 128,
		quality: 70
	},
	watermark: {
		path: 'logo.png',
		position: '',
		opacity: .5
	},
	sizes: []
};

AlbumCreator.defaultSettings = DEFAULT_SETTINGS;

function AlbumCreator(settings) {
	settings = resolveSettings( settings );
	settings.filter = resolveFilters(settings.filter);
	let thisAlbum = {
		watermark: false,
		fileList: [],
		dest: settings.dest
	};

	getFiles(settings.source, settings.filter)
		.then( ready => ready && settings.watermark ? getWatermark(settings.watermark.path) : ready )
		.then( ready => ready ? processing() : false );

	return thisAlbum;


	function resolveSettings(s) {
		s = ( {...DEFAULT_SETTINGS, ...s} );
		s.thumb = s.thumb ? ( {...DEFAULT_SETTINGS.thumb, ...s.thumb} ) : false;
		s.watermark = s.watermark ? ( {...DEFAULT_SETTINGS.watermark, ...s.watermark} ) : false;
		s.sizes = s.sizes || DEFAULT_SETTINGS.sizes;

		s.dest += '/';
		s.source += '/';
		s.thumb ? (s.thumb.subfolder += '/') : 0;

		return s;
	}


	function resolveFilters(f) {
		f = f.replace(/[\s|\.]+/g, ',').split(',').filter((f)=>!!f).map(f=>'\\.'+f+'$').join('|');
		return new RegExp(f);
	}


	function getFiles(source, filter) {
		return new Promise(process).catch(catchingError);

		function process(resolve, reject) {
			thisAlbum.fileList = [];
			fs.readdir(source, (err, files) => err ? reject(err) : resolve( filtering(files) ) );
		}

		function filtering(files) {
			thisAlbum.fileList = files.filter( fileName => filter.test(fileName.toLowerCase()) );
			return thisAlbum.fileList;
		}

		function catchingError(err) {
			console.log('Geting files error from source folder', err);
			return false;
		}
	}



	function getWatermark(logoPaht) {
		return Jimp.read(logoPaht)
			.then((watermark) => thisAlbum.watermark = watermark.opacity(settings.watermark.opacity) )
			.catch(err=>console.log('Geting watermark error', err));
	}



	function processing() {
		thisAlbum.fileList.forEach( processingEach );

		function processingEach(fileName) {
			Jimp.read(settings.source + fileName)
				.then(img => makeThumb(img, fileName))
				.then(img => {
					settings.sizes.forEach((size)=>{
						let newFileName = size.format ? fileName.replace(/(.\w+)$/, '.' + size.format) : fileName;
						let path = thisAlbum.dest + (size.subfolder ? size.subfolder + '/' : '') + newFileName;
						makeImage(img, path, size.width, size.height, size.quality);
					});
				})
		}
	}



	function makeThumb(img, name) {
		if ( settings.thumb ) {
			let newName = settings.thumb.format ? name.replace(/(.\w+)$/, '.' + settings.thumb.format) : name;
			img
				.clone()
				.cover( settings.thumb.size, settings.thumb.size)
				.quality( settings.thumb.quality )
				.write( thisAlbum.dest + settings.thumb.subfolder + newName);
console.log(thisAlbum.dest + settings.thumb.subfolder + newName, 'DONE');
		}
		return img;
	}



	function makeImage(img, path, width, height, quality) {
		img.clone().quality(quality).scaleToFit(width, height)
		if (thisAlbum.watermark) { addWatermark(img); }
		img.write(path);
console.log(path, 'DONE');
		return img;
	}



	function addWatermark(img) {
		let w = img.bitmap.width;
		let h = img.bitmap.height;
		let ww = thisAlbum.watermark.bitmap.width;
		let wh = thisAlbum.watermark.bitmap.height;
		let x = (w - ww) / 2, y = (h - wh) / 2;

		if( match('top|t') ) { y = 0; }
		if( match('bottom|b') ) { y = h - wh; }
		if( match('left|l') ) { x = 0; }
		if( match('right|r') ) { x = w - ww; }

		img.composite(thisAlbum.watermark, x, y);

		function match(m) {
			let re = new RegExp('(?:^|\\b)(' + m + ')(?=\\b|$)');
			let res = settings.watermark.position.match(re) || [];
			return res.length > 0;
		}
	}
}


module.exports = AlbumCreator;