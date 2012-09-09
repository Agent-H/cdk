define([
	'app/models/Sprite',
	'backbone'
], function(
	Sprite
){
	return Backbone.Collection.extend({
		model: Sprite
	});
});