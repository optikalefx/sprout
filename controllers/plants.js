
module.exports = {

	"index"(req, res, next) {
		res.view();
	},

	"search"(req,res) {

		var state = req.body.state;

		app.run(function* (resume) {

			// get current month
			var d = new Date();
			var month = d.getMonth() + 1;

			var climate = yield app.db.collection("climate").findOne({
				state: state
			}, resume);

			var zones = climate.zones.map(function(zone) {
				var obj = {};
				obj["zones." + zone] = {$in: [month]};
				return obj;
			});

			// get all plants for these climates
			var plants = yield app.db.collection("plant").find({
			    image: {$exists:true},
			    $or : zones
			}).toArray(resume);

			res.json(plants);

		});

	}

};
