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
	
	app.save = function(project){
		//User can only save projects
		if(project.id.split('/')[0] != "projects"){
			console.log('not a project');
		}
		else
			project.save();
	};
	
	app.open = function(){
		this.ui.dialogs.open();
	};
	
});