var express = require('express'),
	mongodb = require('mongodb'),
	app = express(),
	port = process.env.PORT || 17009;


/* mongo init */
var db = new mongodb.Db('links',new mongodb.Server('localhost', 27017), {w:-1});

db.open(function(err, linksDb) {
	app.use(express.bodyParser());
	app.use(express.favicon());
	app.use(express.static('public'));
	app.engine('html', require('ejs').renderFile);

	app.get('/', function(req, res){
		return res.send(404);
	});

	/** admin area **/
	app.get('/admin/hits', function(req, res){
		db.collection('hits', function(errCollection, collection){
			if (errCollection){
				return res.send(500);
			}
			collection.find().toArray(function(errFind, entries){
				res.render('hits.ejs', {errFind:err, hits:entries});
			});
		});
	});
	app.get('/admin/links', function(req, res){
		db.collection('links', function(errCollection, collection){
			if (errCollection){
				return res.send(500);
			}
			collection.find().toArray(function(errFind, entries){
				res.render('links.ejs', {errFind:err, links:entries});
			});
		});
	});
	app.get('/links', function(req, res){
		db.collection('links', function(errCollection, collection){
			if (errCollection){
				return res.send(500);
			}
			collection.find().toArray(function(errFind, entries){
				res.json({links:entries});
			});
		});
	});
	app.post('/links', function(req, res){
		db.collection('links', function(errCollection, collection){
			if (errCollection){
				return res.send(500);
			}
			collection.insert(req.body, function(errInsert, result){
				if (errInsert){
					return res.status(500).json({msg:errInsert});
				}
				return res.json(result);
			});
		});
	});
	app.delete('/links/:id', function(req, res){
		db.collection('links', function(errCollection, collection){
			if (errCollection){
				return res.send(500);
			}
			collection.remove({id:req.params.id}, function(errDelete, result){
				console.log('hey', errDelete, result);
				res.send('ok');
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


