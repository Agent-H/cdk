define([
	'app/models/Component',
	'backbone'
], function(
	Component
){
	return Backbone.Collection.extend({
		model: Component
	});
});