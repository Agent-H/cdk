define([
	'app/collections/Entities',
	'app/collections/Components',
	'app/collections/Scenes',
	'app/collections/Sprites',
	'app/collections/Assets',
	'backbone'
], function(
	Entities,
	Components,
	Scenes,
	Sprites,
	Assets
){

	return Backbone.Model.extend({	
		initialize: function(){
			console.log("project model initializing");
			
			this.set("scenes", new Scenes());
			this.set("entities", new Entities());
			this.set("components", new Components());
			this.set("sprites", new Sprites());
			this.set("assets", new Assets());
			
			
		}
	});
	
});