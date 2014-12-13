/* globals app */
var cheerio = require("cheerio");
var request = require("request");

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
		res.view("login");
	},


	"/getImages"(req,res) {

		var plants = "http://www.gardenate.com/plants/";

		request.get(plants, function(err, resp, body) {

			// load body
			var $ = cheerio.load(body);

			// get names
			var plants = $(".plant-group a").map(function() {
				//console.log($(this).text());
				return $(this).text();
			}).get();

			// go through names and get images
			var plant = "carrot";
			var google = "https://www.googleapis.com/customsearch/v1?cx=017576662512468239146%3Aomuauf_lfve&prettyPrint=false&searchType-image&q="+plant+"&key=AIzaSyC0IYqcZpFjzDRb2DgThD7U0vrSKvgyLqY";
			request({
				method: "GET",
				url: google
			}, function(err, resp, body) {

				res.send(body);

			});




		});


	}


};

module.exports = routes;
