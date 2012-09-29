require([
	"app/ui/UI",
	"app/models/Project",
	"app/models/Compiler",
	"backbone"
], 
function(
	UI,
	Project,
	Compiler
) {
	//Short-circuit default backbone.sync's behaviour
	Backbone.sync = function(){};
	
	var app = window.app = {
		models: {
			//Loading default project template
			project: new Project(),
			compiler: new Compiler()
		}
	};
	
	app.ui = new UI(app);
	
	app.save = function(project){
		//User can only save projects
		if(project.id.split('/')[0] != "projects"){
			app.ui.dialogs.save(project);
		}
		else
			project.save();
	};
	
	app.open = function(){
		app.ui.dialogs.open();
	};
	
});