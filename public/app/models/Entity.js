define([
	'app/models/Element'
], function(
	Element
){

	return Element.extend({
		defaults: _.extend({},Element.prototype.defaults, {
			components: []
		}),
		
		initialize: function(){
		}
	});
	
});