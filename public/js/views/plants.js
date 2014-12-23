/* globals navigator, $, Handlebars, _ */

// html5 location
navigator.geolocation.getCurrentPosition(function(location) {
	var lat = location.coords.latitude;
	var lon = location.coords.longitude;

    // update season icon
    var seasons = [
        {season:"winter", months: [12,1,2]},
        {season:"spring", months: [3,4,5]},
        {season:"summer", months: [6,7,8]},
        {season:"fall", months: [9,10,11]}
    ];
    var d = new Date();
    var currentMonth = d.getMonth() + 1;
    var season =  _.find(seasons, function(obj) {
        return _.contains(obj.months, currentMonth);
    }).season;

    // swap out season image now
    $(".season img").attr("src", "/img/" + season + ".png");


	$.ajax({ url:'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lon+'&sensor=true',
         success: function(data){

            // find state
            var addr = _.find(data.results[0].address_components, function(res) {
                return res.types && res.types[0] === "administrative_area_level_1";
            });

             var state = addr.long_name;
             state = state.toLowerCase();
             $(".flagInner").css("backgroundImage","url(/img/flags/"+state+"-flag.jpg)");

            var stateCode = addr.short_name;

             // call to server with our maryland data
            $.post("/plants/search",{state: stateCode}).then(function(plants) {

                plants = _.shuffle(plants);
                plants = plants.splice(0,4);

                // get the plants template
                var template = Handlebars.compile($("#plantsTemplate").html());
                template = template({plants:plants});
                $(".plantList").html(template);

            });

         }
    });



});
