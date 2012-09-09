define([
	'app/models/Element'
], function(
	Element
){

	return Element.extend({
		defaults: _.extend({},Element.prototype.defaults, {
			deps: []
		}),
		
		initialize: function(){
		}
	});
	
});