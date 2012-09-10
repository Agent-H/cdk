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
		defaults: {
			title: ''
		},
		
		initialize: function(){
			console.log("project model initializing");
			
			this.url = "/store/";
			
			this.set("scenes", new Scenes(this.get('scenes')));
			this.set("entities", new Entities(this.get('entities')));
			this.set("components", new Components(this.get('components')));
			this.set("sprites", new Sprites(this.get('sprites')));
			this.set("assets", new Assets(this.get('assets')));
		},
		
		sync: Backbone.sync
	});
});