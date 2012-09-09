define([
	'app/models/Scene',
	'backbone'
], function(
	Scene
){
	return Backbone.Collection.extend({
		model: Scene,
		
		initialize: function(){
			var loadingScene = new Scene({id: "loading", loadingScene: true});
			
			loadingScene.get("entities").add(new (loadingScene.get("entities").model)({id: "loader"}));
			this.add(loadingScene);
			this.add(new Scene({id: "main"}));
		}
	});
});