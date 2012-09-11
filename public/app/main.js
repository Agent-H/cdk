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
			project: new Project({id: "templates/default"})
		}
	};
		
	app.models.project.fetch({
		success: function(){
			console.log("ok");
		},
		error: function(){
			console.log("not ok");
		}
	});
	
	app.ui = new UI(app);
	
});