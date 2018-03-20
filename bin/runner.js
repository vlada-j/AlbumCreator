var os           = require('os'),
	AlbumCreator = require('../lib/album-creator'),
    argv         = require('optimist').boolean('cors').argv,
    settings     = {};


if (argv.h || argv.help) {
	console.log([
		'usage: albumcreator [options] [path]',
		'',
		'options:',
		'  -h --help      Print this list and exit.',
		'  -s --settings  Path to settings in json file'
	].join('\n'));
	process.exit();
}


if (argv.s || argv.settings) {
	settings = require('../' + argv.s || argv.settings);

	AlbumCreator(settings);
}
