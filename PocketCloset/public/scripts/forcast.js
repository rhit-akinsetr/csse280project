/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * Ethan Pabbathi
 */

var rhit = rhit || {};

/** globals */
rhit.apiKey = "4aeec13c77df45718cb234051230711";

fetch("http://api.weatherapi.com/v1/current.json?key=4aeec13c77df45718cb234051230711&q=terre haute&aqi=yes")
    .then(response => response.json())
    .then(data => console.log(data))
.catch(err => console.log("wrong city name"))



/* Main */
/** function and class syntax examples */
rhit.main = function () {
	
};

rhit.main();