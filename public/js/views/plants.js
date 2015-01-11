/* globals navigator, $, Handlebars, _ */
(function() {

	var app = {

		init: function() {

			this.changeSeason();
			this.setLocation();

		},

		changeSeason: function() {
			// map of all seasons to months. This hemisphere only
			var seasons = {
				winter: [12,1,2],
				spring: [3,4,5],
				summer: [6,7,8],
				fall: [9,10,11]
			};

			// figure out what season we are in
			var currentMonth = (new Date()).getMonth() + 1;
			var season =  _.findKey(seasons, function(months) {
				return _.contains(months, currentMonth);
			});

			// swap out season image now
			$(".season img").attr("src", "/img/" + season + ".png");
		},

		setLocation: function() {
			navigator.geolocation.getCurrentPosition(function(location) {
				var lat = location.coords.latitude;
				var lon = location.coords.longitude;

				$.ajax({ url:'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lon+'&sensor=true',
					 success: function(data) {
					 	// find state
						var addr = _.find(data.results[0].address_components, function(res) {
							return res.types && res.types[0] === "administrative_area_level_1";
						});

						 var state = addr.long_name;
						 state = state.toLowerCase();
						 $(".flagInner").css("backgroundImage","url(/img/flags/"+state+"-flag.jpg)");

						var stateCode = addr.short_name;

						app.getPlants(stateCode);
					 }
				});
			});
		},

		getPlants: function(stateCode) {
			 // call to server with our Maryland data
			$.post("/plants/search",{state: stateCode}).then(function(plants) {

				plants = _.shuffle(plants);
				plants = plants.splice(0,4);

				// get the plants template
				var template = Handlebars.compile($("#plantsTemplate").html());
				template = template({plants:plants});
				$(".plantList").html(template);

			});
		}

	};

	// go!
	app.init();

})();
