define([
	'app/ui/templates/dialogsButtons',
	'dhtmlx',
	'jquery',
	'underscore'
], function(
	Buttons
){
	return function(app, dhxWins){
		return function(){
			var win = dhxWins.createWindow('openDialog', 100, 100, 400, 300);
			win.setModal(true);
			win.setText("Open a project");
			
			$.getJSON('store/', function(data){
				
				var layout = win.attachLayout('2E');
				
				var buttonsCell = layout.cells('b');
				buttonsCell.hideHeader();
				buttonsCell.attachObject($('<div id="openFialog_form">').get()[0]);
				var buttons = new dhtmlXForm("openFialog_form", Buttons(['Open', 'Cancel']));
				
				buttonsCell.setHeight(20);
				buttonsCell.fixSize(false, true);
				
				
				
				var treeCell = layout.cells('a');
				treeCell.hideHeader();
				
				
				var tree = treeCell.attachTree();
				
				var id = 1;
				
				var items= _.map(data, function(elem, key){
					return {	id: id++,
							text: key,
							im0: 'folderClosed.gif',
							open: true,
							item: _.map(elem, function(el){
								return {
									id: id++,
									text: el
								};
							})
						}
				});
				
				tree.loadJSONObject({
					id:0,
					item: items
				});
				
				tree.attachEvent('onDblClick', function(){
					open();
				});
				
				buttons.attachEvent('onButtonClick', function(id){
					if(id == 'Open'){
						open();
					}
					else if(id == 'Cancel'){
						cancel();
					}
				});
				
				function open(){
					var sel = tree.getSelectedItemId();
					
					if(tree.getLevel(sel) == 2){
						var projectId = tree.getItemText(tree.getParentId(sel))+'/'+tree.getItemText(sel);
						app.models.project.set('id', projectId);
						app.models.project.fetch();
						win.close();
					}
				}
				
				function cancel(){
					win.close();
				}
			});
		};
	};
});