/* globals app */

var MongoClient = require('mongodb').MongoClient;

app.run = function(generatorFunction) {
    var generatorItr = generatorFunction(function(one, two) {
		if(arguments.length > 1 && one === null) {
			return resume(two);
		} else {
			return resume(one);
		}
	});
    function resume(callbackValue) {
        generatorItr.next(callbackValue);
    }
    generatorItr.next();
};



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

	"/"(req, res, next) {
		// Render the view found at /views/index.html.
		res.view("index");
	}
};

module.exports = routes;
