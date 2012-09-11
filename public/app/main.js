require([
	"app/ui/UI",
	"app/models/Project",
	"backbone"
], 
function(
	UI,
	Project,
	ProjectCollec
) {
	//Short-circuit default backbone.sync's behaviour
	Backbone.sync = function(){};
	
	var app = window.app = {
		models: {
			//Loading default project template
			project: new Project()
		}
	};
	
	app.ui = new UI(app);
	
});