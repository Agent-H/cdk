define([
	'app/ui/templates/settingsForm.js',
	'backbone'
], function(
	Template
){
	return Backbone.View.extend({
	
		initialize: function(){
			this.el.attachObject($('<div id="settings_form">').get()[0]);
			
			var form = this.form = new dhtmlXForm("settings_form", Template);
			
			var project = this.model;
			
			form.attachEvent('onChange', function(id, data){
				if(id == 'title'){
					project.set('title', data);
				}
			});
			
			project.on('change:title', updateTitle, this);
			
			function updateTitle(){
				form.setItemValue('title', project.get('title'));
			}
			
			updateTitle();
		},
	});
});