define([
	'app/models/Element'
], function(
	Element
){
	var Sprite = Backbone.Model.extend({
		defaults: {
			name: '', 
			x:0, 
			y:0, 
			w:20, 
			h:20
		},
		
		initialize: function(){}
	})

	return Element.extend({
		defaults: _.extend({},Element.prototype.defaults, {
			image: '',
			sprites: false
		}),
		
		initialize: function(){
			this.attributes = this.parse(this.attributes);
		},
		
		addSprite : function(){
			var sprt = new Sprite;
			
			this.attributes.sprites.push(sprt);
			
			this.trigger('newSprite', sprt);
			return sprt;
		},
		
		parse: function(response){
			var sprites = new Array();
			for(var i = 0 ; i < response.sprites.length ; i++){
				sprites.push(new Sprite(response.sprites[i]));
			}
			
			response.sprites = sprites;
			
			return response;
		}
	});
	
});