define([
	'app/ui/views/Settings',
	'backbone'
], function(
	SettingsView
){
	return Backbone.View.extend({
	
		initialize: function(){
			var _this = this;
			
			var tabbar = this.tabbar = this.el.attachTabbar();
			tabbar.setImagePath("lib/dhtmlx/imgs/");
			tabbar.enableTabCloseButton(true);
			tabbar.setHrefMode("ajax-html");
			
			tabbar.addTab("welcome_tab", "Welcome to CDK");
			tabbar.setContentHref("welcome_tab","./welcome_tab.html");
			tabbar.setTabActive("welcome_tab");
			
			//Keeps track of opened tabs
			this.openedTabs = new Array("welcome_tab");
			
			tabbar.attachEvent("onTabClose", function(id){
				delete _this.openedTabs[_this.openedTabs.indexOf(id)];
				return true;
			});
			
		},
		
		select: function(type, model){
			console.log("Select : "+type);
			switch(type){
				case 'settings':
					if(this.openedTabs.indexOf('settings') == -1){
						this.openTab('settings', 'Settings');
						new SettingsView({el: this.tabbar.cells('settings')});
					}
					else
						this.tabbar.setTabActive('settings');
				break;
			
			}
		},
		
		openTab: function(id, title){
			this.tabbar.addTab(id, title);
			this.tabbar.setTabActive(id);
			this.openedTabs.push(id);
		},
		
		closeWelcomeTab: function(){
			this.tabbar.removeTab('welcome_tab', true);
		}
	});
});