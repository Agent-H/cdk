define([
	'app/models/Element',
	'app/collections/Entities'
], function(
	Element,
	Entities
){

	return Element.extend({

		defaults: _.extend({},Element.prototype.defaults, {
			
			/* Scene::loadingScene : bool
			
				True if this is the loading scene
				The loading scene loads assets and then switches to "main" scene.
				note : there can not be multiple loading scenes.
			*/
			loadingScene: false,
			
			entities: ''
		}),
		
		initialize: function(){
			this.set('entities', new Entities());
		}
	});
	
});