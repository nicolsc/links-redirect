var express = require('express'),
	mongodb = require('mongodb'),
	bcrypt = require('bcrypt'),
	app = express(),
	port = process.env.PORT || 17009,
	mongodb_conf = require('./mongoConfig').getConfig();





/* if we have a router (like on heroku) or nginx between the client and node, the port on which we access
 the app might be different than the port on which node listen's (ex: on heroku, the client is on port 80),
 but node listens on a random port above 40000. If nothing is present in the config, we assume the client
 accesses node directly */
var checkAdmin = function(req, res, next){
  if (!req.session || !req.session.user){
    return res.redirect('/admin');
  }
  next();
};

console.log('process.env', process.env);
console.log('mongodb conf', mongodb_conf);
/* mongo init */
require('mongodb').MongoClient.connect(mongodb_conf.URI, function(err, db){

	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: 'this is a secret',
        cookie: {maxAge: 3600000 ,  secure: false, httpOnly:false }
       })
    );
	app.use(express.favicon());
	app.use(express.static('public'));
	app.engine('html', require('ejs').renderFile);

	app.get('/', function(req, res){
		return res.send(404);
	});

	/** admin area **/
	app.get('/admin', function(req, res){
		if (req.session && req.session.user){
			return res.redirect('/admin/links');
		}
		res.render('login.ejs');
	});
	app.post('/admin/login', function(req, res){
      if (!req.body || !req.body.name || !req.body.password){
        return res.status(400).json({msg:'Missing parameters'});
      }
      db.collection('users', function(errCollection, collection){
		if (errCollection){
			return res.status(500).json({msg:errCollection});
		}
		collection.find({name:req.body.name}).toArray(function(errFind, entries){
			if (errFind){
				return res.status(500).json({msg:errCollection});
			}
			if (!entries || !entries.length){
				return res.status(403).json({msg:'Unable to log in'});
			}
			bcrypt.compare(req.body.password, entries[0].password, function(errCheck, resCheck) {
				if (errCheck){
					return res.status(500).json({msg:errCheck});
				}
				if (!resCheck){
					return res.status(403).json({msg:'Unable to log in'});
				}
				req.session.user = entries[0];
				return res.json(entries[0]);
			});
		});
      });
    });
	app.get('/admin/hits', checkAdmin, function(req, res){
		db.collection('hits', function(errCollection, collection){
			if (errCollection){
				return res.send(500);
			}
			collection.find().toArray(function(errFind, entries){
				res.render('hits.ejs', {errFind:err, hits:entries});
			});
		});
	});
	app.get('/admin/links', checkAdmin, function(req, res){
		db.collection('links', function(errCollection, collection){
			if (errCollection){
				return res.send(500);
			}
			collection.find().toArray(function(errFind, entries){
				res.render('links.ejs', {errFind:err, links:entries});
			});
		});
	});
	app.get('/links', checkAdmin, function(req, res){
		db.collection('links', function(errCollection, collection){
			if (errCollection){
				return res.send(500);
			}
			collection.find().toArray(function(errFind, entries){
				res.json(entries);
			});
		});
	});
	app.post('/links', checkAdmin, function(req, res){
		db.collection('links', function(errCollection, collection){
			if (errCollection){
				return res.status(500).send({msg:errCollection});
			}
			collection.insert(req.body, function(errInsert, result){
				if (errInsert){
					return res.status(500).json({msg:errInsert});
				}
				return res.json(result);
			});
		});
	});
	app.put('/links/:id', checkAdmin, function(req, res){
		db.collection('links', function(errCollection, collection){
			if (errCollection){
				return res.status(500).send({msg:errCollection});
			}
			var params = {_id:mongodb.ObjectID(req.params.id)};
			delete req.body._id;
			collection.update(params, req.body, function(errUpdate, result){
				if (errUpdate){
					return res.status(500).send({msg:errUpdate});
				}
				return res.json({msg:'Updated '+result});
			});
		});
	});
	app.delete('/links/:id', checkAdmin,  function(req, res){
		db.collection('links', function(errCollection, collection){
			if (errCollection){
				return res.status(500).send({msg:errCollection});
			}
			var params = {_id:mongodb.ObjectID(req.params.id)};
			collection.remove(params,  function(errDelete, result){
				if (errDelete){
					return res.status(500).send({msg:errDelete});
				}
				return res.json({msg:'Deleted '+result});
			});
		});
	});


	app.get('/:entry', function(req, res){
		db.collection('links', function(errEntriesCollection, entriesCollection){
			if (errEntriesCollection){
				return res.status(500).send('An error occurred. '+errEntriesCollection);
			}
			entriesCollection.find({code:req.params.entry}).toArray(function(errEntry, entries){
				if (errEntry){
					res.status(500).send('An error occurred. '+errEntry);
				}
				else if (!entries || !entries.length){
					res.status(404).send("No entry found for "+req.params.entry);
				}
				else{
					console.log('entries', entries)
					var url = entries[0].url;
					if (!url.match(/^https?:\/\//)){
						url = 'http://'+url;
					}
					res.redirect(301, url);
				}
				db.collection('hits', function(errHitsCollection, hitsCollection){
					if (errHitsCollection){
						return ;
					}
					hitsCollection.insert({entry:req.params.entry, status:errEntry ? 'system err': (!entries||!entries.length ? 'not found' : 'success'), date:new Date(), ip:req.header('x-forwarded-for') ? req.header('x-forwarded-for').split(',')[0] : req.connection.remoteAddress}, function(errInsert, resInsert){});
				});


			});
		});
	});
	console.log('Listening on port '+port);
	app.listen(port);

});