/* globals app */

var MongoClient = require('mongodb').MongoClient;

var routes = {

	"*"(req,res,next) {
		app.run(function* (resume) {
			// connect to mongo
			if(!app.db || !app.db.collection) {
				app.db = yield MongoClient.connect(app.config.db.host,resume);
				next();
			} else {
				next();
			}
		});
	},

	"/redirect"(req,res) {
		res.view();
	},

	"/"(req, res, next) {
		// Render the view found at /views/index.html.
		res.view("login");
	}

};

module.exports = routes;
