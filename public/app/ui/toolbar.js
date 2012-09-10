define(['backbone'], function(){
	return Backbone.View.extend({
	
		initialize: function(){
			var _this = this;
			
			this.el.loadXML('app/ui/templates/toolbar.xml', function(){
				_this.updateTitle.call(_this);
				_this.model.on("change:title", _this.updateTitle, _this);
			});
			
			this.el.attachEvent("onClick", function(id){
				switch(id){
					case 'save':
						_this.model.save();
						break;
					case 'load':
						
						break;
				}
			});
			
		},
		
		updateTitle: function(){
			this.el.setItemText('project_title', this.model.get('title'));
		}
	});
});