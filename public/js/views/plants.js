/* globals navigator, $, Handlebars, _ */
(function() {

	var app = {

		plants: [],
		showIndex: 0,

		init: function() {
			this.changeSeason();
			this.setLocation();
			this.attachEvents();
		},

		attachEvents: function() {
			$(".arrow.right").on("click", function(e) {
				e.preventDefault();
				app.getPlantsRight();
			});
			$(".arrow.left").on("click", function(e) {
				e.preventDefault();
				app.getPlantsLeft();
			});
		},

		getPlantsLeft: function() {
			// add the moveLeft class to move all plants out
			$(".plantList .plant").addClass("moveOutRight");

			// wait for animation to end
			setTimeout(function() {
				// move the index to the next 4
				app.showIndex -= 4;

				// get the next 4 plants
				var plants = app.plants.splice(app.showIndex,4);

				// set all plants to start on the left
				plants.map(function(plant) {
					plant.startDisplay = "displayLeft";
				});

				// render those next 4
				app.renderPlants(plants);

				// show those new guys
				setTimeout(function() {
					// remove the right class to show them
					$(".plantList .plant").removeClass("displayLeft");
				},100);

			}, 250 + 400);
		},

		getPlantsRight: function() {
			// add the moveLeft class to move all plants out
			$(".plantList .plant").addClass("moveOutLeft");

			// wait for animation to end
			setTimeout(function() {
				// move the index to the next 4
				app.showIndex += 4;

				// get the next 4 plants
				var plants = app.plants.splice(app.showIndex,4);

				// set all plants to start on the left
				plants.map(function(plant) {
					plant.startDisplay = "displayRight";
				});

				// render those next 4
				app.renderPlants(plants);

				// show those new guys
				setTimeout(function() {
					// remove the right class to show them
					$(".plantList .plant").removeClass("displayRight");
				},100);

			}, 250 + 400);
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
				app.plants = plants; // store for later use
				plants = plants.splice(0,4);

				// at this point were starting from the right
				// add that prop to all plants
				plants.map(function(plant) {
					plant.startDisplay = "displayRight";
				});

				app.renderPlants(plants);

				setTimeout(function() {
					// remove the right class to show them
					$(".plantList .plant").removeClass("displayRight");
				},0);

			});
		},

		renderPlants: function(plants) {
			// get the plants template
			var template = Handlebars.compile($("#plantsTemplate").html());
			template = template({plants:plants});
			$(".plantList").html(template);
		}

	};

	// go!
	app.init();

})();
