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
			
			/***	Layout setup	***/
			var layout = UI.layout = {
				main: new dhtmlXLayoutObject(document.body, '3W')
			};
			
			layout.projectCell = layout.main.cells('a');
			layout.projectCell.setWidth('250');
			
			layout.mainCell = layout.main.cells('b');
			layout.mainCell.hideHeader();	
			
			
			/***	Views setup	***/
			
			UI.views.project = new ProjectView({
				model: app.models.project,
				el: layout.projectCell
			});
			
			UI.toolbar = new Toolbar({
				el: layout.main.attachToolbar()
			});
			
			
			/***	UI events	***/
			
			UI.views.project.on('selected', function(type, model){
				
				console.log("selected : "+type);
				console.log(model);
			}, this);
			
			
			/***	Model events	***/
			
			app.models.project.on("change:title", updateProjectTitle);
			
			
			/***	UI Initialisation	***/
			
			updateProjectTitle(app.models.project.get('title'));
		});
		
		function updateProjectTitle(title){
			UI.layout.projectCell.setText("Project : "+title);
			
			document.title = title+" - Crafty Development Kit";
		}
	
	};
});