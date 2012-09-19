define([
	'app/ui/templates/settingsForm.js',
	'backbone'
], function(
	Template
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
			this.on('onClose', function(){
				this.model.off('change', this.render, this);
			}, this);
			
			
			this.render();
		},
		
		renderSettings: function(){
			var _this = this;
			var sprite = this.model;
			
			var form = this.form = this.settingsCell.attachForm();
			form.loadStruct('app/ui/templates/spriteForm.js', 'json', function(){
				form.setItemValue('image', sprite.get('image'));
				form.setItemValue('x', ''+sprite.get('x'));
				form.setItemValue('y', ''+sprite.get('y'));
				form.setItemValue('w', ''+sprite.get('w'));
				form.setItemValue('h', ''+sprite.get('h'));
			});
			
			form.attachEvent('onChange', function(id, val){
				sprite.set(id, val);
			});
		},
		
		renderPreview: function(){
			this.previewCell.detachObject();
			
			var _this = this;
			var sprite = this.model;
			
			this.updateImage();
			
			if(this.image){
				if(this.image.isImage())
					this.previewCell.attachObject($('<div style="width: 100%; height: 100%; overflow: auto;"><img src="'+this.image.get('dataURI')+'" /></div>').get()[0]);
				else
					this.previewCell.attachObject($('<div class="alert alert-error">Ressource is not an image</div>').get()[0]);
			}
		},
		
		render: function(){
			this.renderSettings();
			this.renderPreview();
		},
		
		updateImage: function(){
			if(this.image)
				this.image.off('change', this.renderPreview, this);
			
			this.image = this.options.project.get('assets').get(this.model.get('image'));
			
			this.image.on('change', this.renderPreview, this);
		}
	});
});