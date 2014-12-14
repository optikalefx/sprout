/* globals app */
var cheerio = require("cheerio");
var request = require("request");
var _ = require("lodash");
var FileCookieStore = require('tough-cookie-filestore');
var j = request.jar(new FileCookieStore('cookies.json'));
request = request.defaults({ jar : j });

var MongoClient = require('mongodb').MongoClient;

app.run = function(generatorFunction) {
    var generatorItr = generatorFunction(function(one, two, three) {
    	if(arguments.length == 1) {
    		return resume(one);
    	} else if (arguments.length == 2) {
    		return resume(two);
    	} else if (arguments.length == 3) {
    		return resume(three);
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

	"/getMonthData"(req,res) {

		var garden = "http://www.gardenate.com/";
		var allPlants = {};

		app.run(function* (resume) {

			var body = yield request.get(garden, resume);

			var $ = cheerio.load(body);

			// get the zones from the drop down
			var zones = $("[name=zone] option").map(function() {
				return {id: $(this).val(), zone: $(this).text()};
			}).get();


			// filter to US only
			zones = zones.filter(function(zone) {
				return !!~zone.zone.search("USA");
			});

			// we need the objects not the text
			zones = zones.map(function(zone) {
				return {
					id: +zone.id,
					zone: zone.zone.match(/Zone (\d+\w)/)[1]
				};
			});

			zones = [{
				id: 107,
				"zone": "2a"
			}];

			for(var i = 0; i < zones.length; i++) {
				var zone = zones[i];
				var zoneUrl = "http://www.gardenate.com/?zone=" + zone.id;

				var npage = yield request.get(zoneUrl, resume);

				var months = [1,2,3,4,5,6,7,8,9,10,11,12];
				months = [2,3];

				// each month
				for(var j = 0; j< months.length; j++) {
					var month = months[j];

					var page = yield request.get({
						url: "http://www.gardenate.com/?month=" + month,
						headers: {
					        'Referer': 'http://www.gardenate.com/?zone=' + zone.id
					    }
					}, resume);

					$ = cheerio.load(page);

					var plants = $(".zone_info").eq(0).find(".rowhover").map(function() {
						return $(this).find("td").eq(0).find("a").text();
					}).get();

					// update these plants now
					plants.forEach(function(plant) {
						if(!allPlants[plant]) allPlants[plant] = {
							zones: {}
						};

						console.log("zone", zone.zone, allPlants[plant].zones[zone.zone]);

						if(!allPlants[plant].zones[zone.zone]) {
							allPlants[plant].zones[zone.zone] = [];
						}

						console.log("zonea", allPlants[plant].zones[zone.zone]);


						allPlants[plant].zones[zone.zone].push(month);

					});

				}
			}

			res.json(allPlants);


		});



	},

	/*
	"/getImages"(req,res) {

		var plants = "http://www.gardenate.com/plants/";

		var images = [];

		request.get(plants, function(err, resp, body) {

			// load body
			var $ = cheerio.load(body);

			// get names
			var plants = $(".plant-group a").map(function() {
				//console.log($(this).text());
				return $(this).text();
			}).get();

			// go through names and get images
			var i = 0;
			plants.forEach(function(plant) {
				var google = "https://www.google.com/search?q=" + plant;
				request({
					url: google,
					headers: {
				        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
				   	}
				}, function(err, resp, body) {

					// load google
					$ = cheerio.load(body);

					// get the main image
					var big = $(".iuth").eq(0).parent().attr("href");


					request.get(big, function(e, resp, body) {

						if(body) {
							$ = cheerio.load(body);

							var full = $(".il_ul").eq(0).find("li a").attr("href");

							i++;


							app.db.collection("plant").insert({
								name: plant,
								image: full,
								zones: [],
								description: ""
							}, function() {

							});

							images.push({plant:plant, image: full});
							console.log(i, plants.length);
							if(i == 69) {
								res.json(images);
							}
						}
					});
				});
			});

		});
	}
	*/


};

module.exports = routes;
