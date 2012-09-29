define(['backbone'], function(){
	return Backbone.View.extend({
	
		initialize: function(){
			var _this = this;
			var app = this.model;
			var project = this.project = app.models.project;

			
			this.el.loadXML('app/ui/templates/toolbar.xml', function(){
				_this.updateTitle.call(_this);
				project.on("change:title", _this.updateTitle, _this);
			});
			
			this.el.attachEvent("onClick", function(id){
				switch(id){
					case 'save':
						app.save(project);
						break;
					case 'open':
						app.open();
						break;
					case 'new':
						project.create();
						break;
					case 'build':
						app.models.compiler.build(project, {root: ''});
						break;
					case 'test':
						app.ui.testing.test();
						break;
				}
			});
			
		},
		
		updateTitle: function(){
			this.el.setItemText('project_title', this.project.get('title'));
		}
	});
});