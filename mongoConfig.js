module.exports = {
	getConfig : function(){
		var mongodb_uri =  process.env.MONGOHQ_URL || process.env.MONGOLAB_URI|| 'mongodb://localhost:27017/links';
		var mongodb_infos = mongodb_uri.replace(/^mongodb:\/\//gi, '').split('/');
		var config = {};
		config.URI = mongodb_uri;
		config.DB_NAME = mongodb_infos[1];

		var conf_host = mongodb_infos[0].split(':');
		config.PORT = conf_host.pop();
		config.HOST = conf_host.join(':');

		console.log('config', config);

		return config;

	}
};