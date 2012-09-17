define([
	'backbone'
], function(
){
	return Backbone.View.extend({
	
		initialize: function(){
			
			var layout = this.el.attachLayout('2U');
			layout.setAutoSize("a", "a;b");
			
			this.previewCell = layout.cells('a');
			this.previewCell.setText('Preview');
			
			this.settingsCell = layout.cells('b');
			this.settingsCell.setText('Settings');
			this.settingsCell.setWidth('300');
			
			this.model.on('change', this.render, this);
			
			this.render();
		},
		
		renderPreview: function(){
			var data = this.model.get('dataURI');
			if(!data){
				this.previewCell.attachObject($('<div class="alert">No ressource loaded.</div>').get()[0]);
			}
			else if(data.substr(0, 10) == 'data:image'){
				this.previewCell.attachObject($('<div style="width: 100%; height: 100%; overflow: auto;"><img src="'+data+'" /></div>').get()[0]);
			}
			else if(data.substr(0, 10) == 'data:audio'){
				//TODO
			}
			else{
				this.previewCell.attachObject($('<div class="alert alert-error">Ressource should be audio or image</div>').get()[0]);
			}
		},
		
		renderSettings: function(){
			var asset = this.model;
			
			var $form = $('<div />');
			var loader = $('<img src="img/ajax_loader.gif"/>').css({position: 'absolute', top: 0, left: 0}).hide().appendTo($form);
			
			this.settingsCell.attachObject($form.get()[0]);
			
			var form = new dhtmlXForm($form.get()[0]);
			form.loadStruct('app/ui/templates/assetForm.js', 'json', function(){
				var fileInput = $form.find('input[name="data"]').get()[0];

				fileInput.addEventListener('change', handleFileChange, false);
				
				form.setItemValue('filename', asset.get('name'));
				form.setItemValue('filetype', asset.get('type'));
			});
			
			function handleFileChange(e){
				loader.show();
				
				var file = e.target.files[0];
				
				var reader = new FileReader();
				
				reader.onload = function(d) {
					asset.set({
						dataURI: d.target.result,
						name: file.name,
						type: file.type
					});
					loader.hide();
				};
				
				reader.readAsDataURL(e.target.files[0]);
			}
		},
		
		render: function(){
			this.renderPreview();
			this.renderSettings();
		}
	});
});