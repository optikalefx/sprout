/* globals app */

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
