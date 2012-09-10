define(['backbone'], function(){
	return Backbone.View.extend({
	
		initialize: function(){
			var tabbar = this.tabbar = this.el.attachTabbar();
			tabbar.setImagePath("lib/dhtmlx/imgs/");
			tabbar.enableTabCloseButton(true);
			tabbar.setHrefMode("ajax-html");
			
			tabbar.addTab("helloPage", "Welcome to CDK");
			tabbar.setContentHref("helloPage","./hellopage.html");
			tabbar.setTabActive("helloPage");
		},
		
		select: function(type, model){
			console.log("Select : "+type);
			switch(type){
				case 'settings':
					console.log(this.tabbar.getLabel("settings"));
				break;
			
			}
		}
	});
});