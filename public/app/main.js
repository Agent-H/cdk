require([
	"app/ui/UI",
	"app/models/Project",
	"backbone"
], 
function(
	UI,
	Project
) {
	
	//Short-circuit default backbone.sync's behaviour
	Backbone.sync = function(){};
	
	var app = window.app = {
		models: {
			project: new Project()
		}
	};
	
	app.ui = new UI(app);
	
});