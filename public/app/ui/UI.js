define([
	"app/ui/ProjectBrowser",
	"app/ui/Toolbar",
	"app/ui/MDIArea",
	"jquery",
	"dhtmlx"
],

function(
	
	ProjectBrowser,
	Toolbar,
	MDIArea
	
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
			
			layout.settingsCell = layout.main.cells('c');
			layout.settingsCell.setWidth('300');
			
			
			/***	Views setup	***/
			
			UI.projectBrowser = new ProjectBrowser({
				model: app.models.project,
				el: layout.projectCell
			});
			
			UI.toolbar = new Toolbar({
				el: layout.main.attachToolbar(),
				model: app.models.project
			});
			
			UI.MDIArea = new MDIArea({
				el: layout.mainCell
			});
			
			
			/***	UI events	***/
			
			UI.projectBrowser.projectView.on('selected', function(type, model){
				UI.MDIArea.select(type, model);
			}, this);
			
			
			/***	Model events	***/
			
			app.models.project.on("change:title", function(d){
				updateProjectTitle(d.get('title'));
			});
			
			
			/***	UI Initialisation	***/
			
			updateProjectTitle(app.models.project.get('title'));
		});
		
		function updateProjectTitle(title){
			document.title = title+" - Crafty Development Kit";
		}
	
	};
});