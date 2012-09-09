define([
	"app/ui/project",
	"app/ui/toolbar",
	"jquery",
	"dhtmlx"
],

function(
	
	ProjectView,
	Toolbar
	
	){
	
	//Constructor for UI
	return function(app){
		
		var UI = this;
		this.views = new Array();
		
		//DHTMLX config
		dhtmlx.image_path='lib/dhtmlx/imgs/';
		
		$(function(){
			console.log("building layout");
			//Main layout setup
			var main_layout = new dhtmlXLayoutObject(document.body, '3W');
			
			var projectCell = main_layout.cells('a');
			projectCell.setWidth('250');
			projectCell.setText("Project browser");
			
			var mainCell = main_layout.cells('b');
			mainCell.hideHeader();
			
			UI.views.project = new ProjectView({
				model: app.models.project,
				el: projectCell
			});
			
			UI.toolbar = new Toolbar({
				el: main_layout.attachToolbar()
			});
			
			UI.views.project.on('selected', function(arg){
				console.log("selected : "+arg.type);
				console.log(arg.model);
			}, this);
			
		});
	
	};
});