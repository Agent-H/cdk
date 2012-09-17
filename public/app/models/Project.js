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
			title: 'untitled',
			id: 'project/0'
		},
		
		initialize: function(){
			this.url = "/store/";
			
			this.set("scenes", new Scenes(this.get('scenes')));
			this.set("entities", new Entities(this.get('entities')));
			this.set("components", new Components(this.get('components')));
			this.set("sprites", new Sprites(this.get('sprites')));
			this.set("assets", new Assets(this.get('assets')));
		},
		
		open: function(id){
			var _this = this;
			
			this.close();
			
			this.set('id', id);
			this.fetch({
				success: function(){
					_this.trigger('opened');
				}
			});
		},
		
		close: function(){			
			this.get("scenes").reset();
			this.get("entities").reset();
			this.get("components").reset();
			this.get("sprites").reset();
			this.get("assets").reset();
			
			this.trigger('closed');
		},
		
		create: function(){
			this.close();
			//TODO : create remote project
		},
		
		//Proxying Backbone.sync function
		sync: (function(){
			var sync = Backbone.sync;
			return function(a,b,c){
				var url = this.url;
				this.url = url+this.id;
				
				sync.call(this, a, b, c);
				
				this.url = url;
			};
		})(),
		
		parse: function(response){
			var obj = {};
			
			//In case of saving
			if(typeof(response.id) != 'undefined')
				obj.id = response.id;
			//In case of loading
			else if(response.title){
				obj.title = response.title,
				obj.entities = new Entities(response.entities),
				obj.scenes = new Scenes(response.scenes),
				obj.components = new Components(response.components),
				obj.sprites = new Sprites(response.sprites),
				obj.assets = new Assets(response.assets)
			}
			else
				return;
			
			return obj;
		}
	});
});