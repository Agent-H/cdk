define([
	'app/models/Scene',
	'backbone'
], function(
	Scene
){
	return Backbone.Collection.extend({
		model: Scene,
		
		initialize: function(){
		}
	});
});