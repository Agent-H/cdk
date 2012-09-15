define([
	'app/ui/templates/dialogsButtons',
	'dhtmlx',
	'jquery'
], function(
	Buttons
){
	return function(app, dhxWins){
		return function(project){
			var win = dhxWins.createWindow('saveDialog', 100, 100, 500, 300);
			win.setModal(true);
			win.setText("Save project");
			
			$.getJSON('store/projects', function(data){
				console.log(data);
				
				var layout = win.attachLayout('2E');
				var buttonsCell = layout.cells('b');
				buttonsCell.hideHeader();
				buttonsCell.attachObject($('<div id="saveDialog_form">').get()[0]);
				
				var formData = [{type: 'input', name:'name'},{type:"newcolumn"}];
				
				var form = new dhtmlXForm("saveDialog_form", formData.concat(Buttons(['Save', 'Cancel'])));
				
				buttonsCell.setHeight(20);
				buttonsCell.fixSize(false, true);
				
				var listCell = layout.cells('a');
				listCell.hideHeader();
				
				var obj = '<ul class="nav nav-list" style="height: 100%;overflow:auto;">';
				
				for(var i = 0 ; i < data.length ; i++){
					obj += '<li><a href="#" data-name="'+data[i]+'" class="saveLink">'+data[i].split('.')[1]+'</a></li>';
				}
				
				listCell.attachObject($(obj+'</ul>').get()[0]);
				
				$('.saveLink').click(function(){
					form.setItemValue('name', $(this).text());
				});
				
				form.attachEvent('onButtonClick', function(id){
					if(id == 'Save'){
						save();
					}
					else if(id == 'Cancel'){
						cancel();
					}
				});
				
				form.setItemValue('name', project.id.split('.')[1]);
				
				function cancel(){
					win.close();
				}
				
				function save(){
				}
			});
		};
	};
});