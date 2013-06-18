var mongodb = require('mongodb');
var bcrypt = require('bcrypt');
var util = require('util');

var mongodb_conf = require('./mongoConfig').getConfig();

var credentials = {
	salt:bcrypt.genSaltSync(10)
};


var db =  require('mongodb').MongoClient.connect(mongodb_conf.URI, function(err, db){
	if (err){
		console.log('=== Unable to connect to DB ===');
		console.log('=== ', mongodb_conf);
		console.log('===                         ===');
		console.log('===', err);
		console.log('===============================');
		process.exit(0);
	}
	/* Ask for username */
	process.stdout.write('=== Set up a new user. ====\n');
	process.stdout.write('Username : ');
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.once('data', function (data) {
		credentials.name = data.toString().trim();
		process.stdout.write('Password (will be hashed): ');
		process.stdin.once('data', function (data){
			credentials.password = bcrypt.hashSync(data.toString().trim(),credentials.salt);
			db.collection('users', function(err, collection){
				if (err){
					console.log('=== Unable to run script ===');
					console.log(err);
					console.log('============================');
					process.exit(0);
				}
				collection.count({name:credentials.name}, function(countErr, countResult){
					if (countResult){
						console.log('=== Unable to run script ===');
						console.log('===    Already '+countResult+' users   ===');
						console.log('============================');
						process.exit(0);
					}
					collection.insert(credentials, function(insertErr, insertResult){
						console.log('=== Insert user ===');
						if (insertErr){
							console.log('=== An error occurred');
							console.log(err);
						}
						else{
							console.log('=== Success');
							console.log(insertResult);
						}
						console.log('============================');
						process.exit(0);
					});
				});
			});
		});
	});
});