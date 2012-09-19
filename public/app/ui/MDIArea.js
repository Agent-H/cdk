define([
	'app/ui/views/Settings',
	'app/ui/views/Entity',
	'app/ui/views/Component',
	'app/ui/views/Sprite',
	'app/ui/views/Scene',
	'app/ui/views/Asset',
	'backbone'
], function(
	SettingsView,
	EntityView,
	ComponentView,
	SpriteView,
	SceneView,
	AssetView
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
			
			this.views = {};
			
			tabbar.attachEvent("onTabClose", function(id){
				_this.views[id].view.model.off('change:id', _this.views[id].changeHandler, _this);
				_this.views[id].view.trigger('onClose');
				delete _this.views[id];
				delete _this.openedTabs[_this.openedTabs.indexOf(id)];
				return true;
			});
			
			this.Views = {
				settings: SettingsView,
				entity: EntityView,
				component: ComponentView,
				sprite: SpriteView,
				scene: SceneView,
				asset: AssetView
			};
			
			this.model.on('closed', function(){
				this.tabbar.clearAll();
			}, this);
		},
		
		makeTabId: function(type, model){
			return (type == 'settings') ? 'settings' : type+model.cid;
		},
		
		searchTab: function(id){
			return (this.openedTabs.indexOf(id) != -1);
		},
		
		selectTab: function(id){
			if(this.searchTab(id)){
				this.tabbar.setTabActive(id);
				return true;
			}
			return false;
		},
		
		createTab: function(type, model, id){
			if(!id) id = this.makeTabId(type, model);
			
			var title = (type == 'settings') ? 'Settings' : model.id;
			
			this.openTab(id, title);
			
			this.views[id] = {
				view : new this.Views[type]({
					el: this.tabbar.cells(id),
					model: model,
					project: this.model
				}),				
				changeHandler: function(model, label){
					this.tabbar.setLabel(id, label);
				}
			};
			
			model.on('destroy', function(){	this.tabbar.removeTab(id);	}, this);
			
			if(id != 'settings'){
				model.on('change:id', this.views[id].changeHandler, this);
			}
		},
		
		openTab: function(id, title){
			this.tabbar.addTab(id, title);
			this.tabbar.setTabActive(id);
			this.openedTabs.push(id);
		},
		
		select: function(type, model){
			console.log("Select : "+type);
			
			var tabId = this.makeTabId(type, model);
			
			if(!this.selectTab(tabId))
				this.createTab(type, model, tabId);
		},
		
		closeWelcomeTab: function(){
			this.tabbar.removeTab('welcome_tab', true);
		}
	});
});