var express = require('express'),
	redis = require('redis'),
	db = redis.createClient();


var app = express.createServer(),
	port = 3000;

// Configure the server.
app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.use(express.bodyParser());
app.set('jsonp callback', 'callback');

// Setup a pre-condition that requires a token for access to
// everything except the home page.
app.all('/:op*', function(req, res, next) {
	if(!req.param('token')) {
		return next(new Error('Token required for access.'));
	} else {
		db.hexists("app", req.param('token'), function(err, exists) {
			if(!exists) {
				return next(new Error("No app with token: " + req.param('token')));
			}

			req.token = req.param('token');
			next();
		});
	}
});

// Route the home page to views/index.jade
app.all('/', function(req, res){
    res.render('index');
});

// Route /name, /name/get, and /name/set
app.all('/name/:op?', function(req, res, next) {
	if(req.params.op === "set") {
		// Set the Name
		db.hexists("app", req.token, function(err, exists) {
			if(!exists) {
				throw new Error("No app with token: " + req.token);
			}

			db.hset("app", req.token, req.param('name'), function(err, result) {
				res.json(true);
			});
		});
	} else {
		console.log(req.token, req.params);
		// Get the Name
		db.hget("app", req.token, function(err, name) {
			if(!name) {
				res.json(new Error("No app with token: " + req.token));
			}

			res.json({name: name});
		});;
	}
});

// Route /message, /message/get, and /message/send
app.all('/message/:op?', function(req, res) {
	if(req.params.op === "send") {
		// Send message
	} else {
		// Get message
	}

	res.json({});
});

console.log("CuteTypo running on port " + port);
app.listen(port);
