/* Element.js
	Abstract model defining base properties of every project's element.
*/

define([
	'backbone'
], function(){

	return Backbone.Model.extend({
		defaults: {
			/* Path : helps user organise the project in the project tree. */
			path: '/'
		},
		
		initialize: function(){
		}
	});
	
});