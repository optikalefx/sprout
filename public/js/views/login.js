/* globals window, hello, $ */
(function() {
	"use strict";

	// hello.js
	hello.init({
		facebook: "1511965412416489",
		twitter: "ID6NEGbE02VTr1UGyak9CnmQD"
	});

	// login buttons
	$(".social .network").on("click", function(e) {
		e.preventDefault();
		var network = $(this).attr("data-network");

		hello.login(network, {
			scope: "email",
			redirect_uri: '/redirect'
		}, function(auth, status) {
			if (status !== 'complete' || !auth.authResponse) throw new Error(auth.error && auth.error.message || "User not logged in.");
			console.log("success");

			// get data about the user
			hello(network).api("me").then(function(socialUser) {
				console.log(socialUser);
				window.location = "/plants";
			});
		});

	});


})();
