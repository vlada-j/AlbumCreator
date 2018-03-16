var os				= require('os'),
	AlbumCreator	= require('../lib/album-creator'),
    argv			= require('optimist').boolean('cors').argv;


if (argv.h || argv.help) {
	console.log([
		'usage: http-server [path] [options]',
		'',
		'options:',
		'  -h --help    Print this list and exit.'
	].join('\n'));
	process.exit();
}

