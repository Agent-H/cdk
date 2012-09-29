define([
	"app/ui/ProjectBrowser",
	"app/ui/Toolbar",
	"app/ui/MDIArea",
	"app/ui/Dialogs",
	"app/ui/Testing",
	"jquery",
	"dhtmlx"
],

function(
	
	ProjectBrowser,
	Toolbar,
	MDIArea,
	Dialogs,
	Testing
	
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
				main: new dhtmlXLayoutObject(document.body, '2U')
			};
			
			layout.projectCell = layout.main.cells('a');
			layout.projectCell.setWidth('250');
			
			layout.mainCell = layout.main.cells('b');
			layout.mainCell.hideHeader();
			
			
			/***	Dialogs	***/
			UI.dhxWins = layout.main.dhxWins;
			
			UI.dialogs = Dialogs(app, UI.dhxWins);
			
			
			/***	Views setup	***/
			
			UI.projectBrowser = new ProjectBrowser({
				model: app.models.project,
				el: layout.projectCell
			});
			
			UI.toolbar = new Toolbar({
				el: layout.main.attachToolbar(),
				model: app
			});
			
			UI.MDIArea = new MDIArea({
				el: layout.mainCell,
				model: app.models.project
			});
			
			UI.testing = new Testing({
				el: window.document.getElementById('testContainer')
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