/* globals navigator, $, Handlebars */

// html5 location
navigator.geolocation.getCurrentPosition(function(location) {
	var lat = location.coords.latitude;
	var lon = location.coords.longitude;

    // update season icon

	$.ajax({ url:'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lon+'&sensor=true',
         success: function(data){
             var state = data.results[0].address_components[5].long_name;
             state = state.toLowerCase();
             $(".flagInner").css("backgroundImage","url(/img/flags/"+state+"-flag.jpg)");

            var stateCode = data.results[0].address_components[5].short_name;

             // call to server with our maryland data
            $.post("/plants/search",{state: stateCode}).then(function(plants) {

                plants = plants.splice(0,4);

                // get the plants template
                var template = Handlebars.compile($("#plantsTemplate").html());
                template = template({plants:plants});
                $(".plantList").html(template);

            });

         }
    });



});
