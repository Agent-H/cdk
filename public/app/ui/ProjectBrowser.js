define([
	'app/ui/views/Project.js',
	'backbone'], 
function(
	ProjectView
){
	return Backbone.View.extend({
	
		initialize: function(){
			
			var layout = this.el.attachLayout('1C');
			
			var viewCell = layout.cells('a');
			viewCell.hideHeader();
			
			var tree = viewCell.attachTree();
			
			var projectView = this.projectView = new ProjectView({
				model: this.model,
				el: tree
			});
			
			var toolBar = this.toolBar = layout.attachToolbar();
			
			toolBar.setIconsPath('./img/');
			toolBar.loadXML('app/ui/templates/projectToolbar.xml');
			
			toolBar.attachEvent("onClick", function(id){   
				switch(id){
					case 'rename':
						tree.editItem(tree.getSelectedItemId());
						break;
					case 'new':
						projectView.add(tree.getSelectedItemId());
						break;
					case 'remove':
						projectView.remove(tree.getSelectedItemId());
						break;
					case 'copy':
						projectView.copy(tree.getSelectedItemId());
						updatePasteState();
						break;
					case 'paste':
						if(projectView.checkPastePossible(tree.getSelectedItemId()))
							projectView.paste(tree.getSelectedItemId());
						break;
					case 'new_childEnt':
						projectView.addChildEntity(tree.getSelectedItemId());
						break;
					case 'refresh':
						projectView.render();
						break;
					case 'new_dir':
						tree.editItem(projectView.mkdir(tree.getSelectedItemId()));
						break;
					case 'new_component':
					case 'new_entity':
					case 'new_scene':
					case 'new_sprite':
					case 'new_asset':
						projectView.add(id.split('_')[1]);
						break;
				}
			});
			
			tree.attachEvent("onSelect", function(id){
				var infos = projectView.getElementInfos(id);
				
				if(!infos.isRoot && infos.type == 'scene')
					toolBar.enableListOption('new', 'new_childEnt');
				else
					toolBar.disableListOption('new', 'new_childEnt');
					
				if(!infos.isRoot && infos.type != 'folder' && infos.type != 'scene')
					toolBar.disableListOption('new', 'new_dir');
				else
					toolBar.enableListOption('new', 'new_dir');
				
				updatePasteState();
			});
			
			function updatePasteState(){
				if(projectView.checkPastePossible(tree.getSelectedItemId()))
					toolBar.enableItem('paste');
				else
					toolBar.disableItem('paste');
			};
			
		}
	});
});