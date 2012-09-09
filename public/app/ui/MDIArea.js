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
		}
	});
});