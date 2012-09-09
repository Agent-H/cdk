define([
	'app/models/Entity',
	'backbone'
], function(
	Entity
){
	return Backbone.Collection.extend({
		model: Entity
	});
});