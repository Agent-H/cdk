define([
	'app/models/Asset',
	'backbone'
], function(
	Asset
){
	return Backbone.Collection.extend({
		model: Asset
	});
});