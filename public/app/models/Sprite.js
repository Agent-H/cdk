define([
	'app/models/Element'
], function(
	Element
){

	return Element.extend({
		defaults: _.extend({},Element.prototype.defaults, {
			image: '',
			x:0,
			y:0,
			w:0,
			h:0
		}),
		
		initialize: function(){
		}
	});
	
});