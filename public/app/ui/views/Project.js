define([
	'app/ui/templates/project',
	'app/models/Component',
	'app/models/Entity',
	'app/models/Scene',
	'app/models/Sprite',
	'app/models/Asset',
	'backbone'
], function(
	Treetemplate,
	Component,
	Entity,
	Scene,
	Sprite,
	Asset
){
	
	//Path of custom icons
	var iconsPath = '../../../img/';
	
	//Values for the types of pieces of project
	var types = {
				st: 'settings',
				c: 'component',
				sc: 'scene',
				e: 'entity',
				sp: 'sprite',
				a: 'asset',
				f: 'folder'
			};
	
	var getUniqID = (function(){
		var id = 0;
		return function(){return id++;};
	})();
	
	return Backbone.View.extend({
	
		initialize: function(){		
			var _this = this;
			
			this.el.setIconsPath('lib/dhtmlx/imgs/');
			this.el.enableItemEditor(true);
			this.el.setEditStartAction(false, false);
			this.el.enableDragAndDrop(true, false);
			
			
			this.el.attachEvent("onDblClick", function(id){
				var infos = _this.getElementInfos(id);
				
				if(!infos.isRoot && infos.type != 'folder'){
					_this.trigger('selected', infos.type, _this.getTargetCollection(infos).getByCid(infos.id));
					_this.trigger('selected:'+infos.type, _this.getTargetCollection(infos).getByCid(infos.id));
				}
				else if(infos.type == 'settings'){
					_this.trigger('selected', infos.type, _this.model);
					_this.trigger('selected:'+infos.type, _this.model);
				}
			});
			
			
			/***	Drag-n-drop setup	***/
			
			this.el.attachEvent("onBeforeDrag", function(sId){
				return !_this.getElementInfos(sId).isRoot;
			});
			
			this.el.attachEvent("onDrag", function(sId,tId,id,sObject,tObject){
				if(!_this.checkDrag.call(_this, sId, tId)){
					return false;
				}
				_this.onDrag.call(_this, sId,tId);
				
				return true;
			});
			
			this.el.attachEvent("onDrop", function(sId,tId,id,sObject,tObject){
				return _this.onDrop.call(_this, sId,tId);
			});
			
			this.el.attachEvent("onDragIn", function(dId,lId,sObject,tObject){
				return _this.checkDrag.call(_this, dId,lId);
			});
			
			
			/***	Edit setup	***/
			
			this.el.attachEvent("onEdit", (function(){
				var correctVal = '';
				var prevVal = '';
				return function(state,id,tree,value){
					//Prevents editing of tree root elems
					if(state == 0){
						prevVal = value;
						return !_this.getElementInfos(id).isRoot;
					}
					
					if(state == 2){
						if(value != prevVal){
							//On applique une vérification
							if(value.indexOf(' ') != -1){
								correctVal = '';
								return false;
							}
						
						
							if(_this.getElementInfos(id).type == 'folder')
								correctVal = _this.findFreeFolderName(_this.el.getParentId(id), value);
							else
								correctVal = _this.findFreeElementName(_this.getTargetCollection(id), value);
						}
						else
							correctVal = value;
					}
					
					if(state == 3 && correctVal != ''){
						return _this.rename.call(_this, id, correctVal);
					}
					return true;
				};
			})());
			
			//initialisation du contextMenu
			this.initContextMenu();
			
			this.model.get("entities").on("add remove", this.render, this);
			this.model.get("components").on("add remove", this.render, this);
			this.model.get("scenes").on("add remove", this.render, this);
			this.model.on("change", this.render, this);
			
			var scenes = this.model.get("scenes").models;
			
			for(var i = 0 ; i < scenes.length ; i++){
				scenes[i].get('entities').on("add remove", this.render, this);
			}
			
			this.clipboard = {};
			
			
			//Project events
			this.model.on('closed', this.render, this);
			
			this.render();
		},
		
		getElementInfos: function(itemID){
			var ret = {
				type: '',
				shortType: '',
				id: '',
				isRoot: false,
				itemID: itemID
			};
			
			//L'item est une racine
			if(_.values(types).indexOf(itemID) != -1){
				ret.type = itemID;
				ret.isRoot = true;
			}
			else if(typeof(itemID) == 'string'){
				var info = itemID.split(' ');
				if(info.length == 2){
					ret.type = types[info[0]];
					ret.shortType = info[0];
					ret.id = info[1];
				}
			}

			return ret;
		},
		
		checkDrag: function(sId,tId){
			var tInfos = this.getElementInfos(tId),
				sInfos = this.getElementInfos(sId);
			
			if(tInfos.isRoot){
				if(sInfos.type == 'folder'){
					pInfos = this.getElementInfos(this.getParentElementId(sId));
					return (pInfos.type == tInfos.type && !(pInfos.type == 'scene' && !pInfos.isRoot)) || (tInfos.type == 'entity' && pInfos.type == 'scene' && !pInfos.isRoot);
				}
				else
					return tInfos.type == sInfos.type;
			}
			
			if(tInfos.type == 'folder'){
				var pInfos = this.getElementInfos(this.getParentElementId(tId));
				
				if(sInfos.type == 'folder'){
					psInfos = this.getElementInfos(this.getParentElementId(sId));
					return (pInfos.type == psInfos.type)
						|| (psInfos.type == 'entity' && pInfos.type == 'scene' && !pInfos.isRoot)
						|| (pInfos.type == 'entity' && psInfos.type == 'scene' && !psInfos.isRoot);
				}
				else
					return (pInfos.type == sInfos.type && !(pInfos.type == 'scene' && !pInfos.isRoot)) || (pInfos.type == 'scene' && !pInfos.isRoot && sInfos.type == 'entity');
			}
			
			if(tInfos.type == 'scene'){
				if(sInfos.type == 'folder'){
					var pInfos = this.getElementInfos(this.getParentElementId(sId));
					return pInfos.type == 'entity';
				}
				else
					return sInfos.type == 'entity';
			}
			
			return false;
		},
		
		getParentElementId: function(itemId){
			var infos = {
				itemID: itemId
			};
			
			do{
				infos = this.getElementInfos(this.el.getParentId(infos.itemID));
			} while((infos.type == '' || infos.type == 'folder') && this.el.getLevel(infos.itemID) > 1);
			
			return infos.itemID;
		},
		
		getElementPath: function(itemId, skipDir){
			if(!skipDir) skipDir = false;	//true : skips item if item is a dir
			
			var path = '/';
			var infos = this.getElementInfos(itemId);
			
			if(infos.type == 'folder' && !skipDir)
				path = '/'+this.el.getItemText(itemId)+path;
					
			do{
				infos = this.getElementInfos(this.el.getParentId(infos.itemID));
				if(infos.type == 'folder')
					path = '/'+this.el.getItemText(infos.itemID)+path;
			} while((infos.type == '' || infos.type == 'folder') && this.el.getLevel(infos.itemID) > 1);
			
			return path;
		},
		
		
		//Returns dir itemId based on path following the root 'root'
		findDirId: function(root, path){
			var dirs = _.compact(path.split('/'));
			
			var current = root;
			
			for(var i = 0 ; i < dirs.length ; i++){
				var subitems = _.compact(this.el.getSubItems(current).split(','));
				
				var result = _.find(subitems, function(it){
					return this.el.getItemText(it) == dirs[i];
				}, this);
								
				current = result;
			}
			
			return current;
		},
		
		getTargetModel: function(infos){
			if(infos.type == 'folder' || infos.type == 'entity'){
				var pInfos = this.getElementInfos(this.getParentElementId(infos.itemID));
				if(pInfos.type == 'scene' && !pInfos.isRoot)
					return this.model.get('scenes').getByCid(pInfos.id);
			}			
			return this.model;
		},
		
		getTargetCollection: function(infos){
			var model2collec = {
				component: 'components',
				entity: 'entities',
				scene: 'scenes',
				sprite: 'sprites',
				asset: 'assets'
			};
			
			if(typeof(infos) == 'string'){
				infos = this.getElementInfos(infos);
			}

			return this.getTargetModel(infos).get(model2collec[infos.type]);
		},
		
		//Applies function fn to each child of the specified elem(id)
		forEachChild: function(id, fn, ctx){
			var children = _.compact(this.el.getSubItems(id).split(','));
			
			for(var i = 0 ; i < children.length ; i++){
				fn.call(ctx, children[i]);
			}
		},
		
		onDrop: function(sId, tId){
			var sInfos = this.getElementInfos(sId);
				
			if(sInfos.type != 'folder'){
				if(!this.dragCollection || !this.dropCollection){
					console.log("error : no drag or drop collection");
					return;
				}
				
				this.dropCollection = this.getTargetCollection(this.getElementInfos(sId));
				
				var elem = this.dragCollection.getByCid(sInfos.id);
				
				var clone = elem.clone();
				clone.set('path', this.getElementPath(tId));
				var cid = elem.cid;
				elem.destroy({silent: true});
				
				clone.set('id', this.findFreeElementName(this.dropCollection, clone.id));
				clone.cid = cid;
				
				this.dropCollection.add(clone, {silent: true});		
				this.el.setItemText(sId, clone.id);
			}
			else{				
				this.forEachChild(sId, function(child){
					this.onDrop(child, sId);
				}, this);
			}
			
			return true;
		},
		
		//On cherche quelle collection va être prélevée
		onDrag: function(sId, tId){
			var tInfos = this.getElementInfos(tId),
				sInfos = this.getElementInfos(sId);
				
			if(sInfos.type != 'folder'){
				this.dragCollection = this.getTargetCollection(sInfos);
				
				tInfos.type = sInfos.type;
				this.dropCollection = this.getTargetCollection(tInfos);
			}
			else{
				this.forEachChild(sId, function(child){
					this.onDrag(child, sId);
				}, this);
			}
			
			return true;
		},
		
		remove: function(id){
			if(!id) return;
			var infos = this.getElementInfos(id);
			
			if(infos.isRoot)
				return;
				
			if(infos.type != 'folder'){
				this.getTargetCollection(infos)
					.getByCid(infos.id)
						.destroy({silent: true});
				this.el.deleteItem(id);
			}
			else{
				this.forEachChild(id, this.remove, this);
				this.el.deleteItem(id);
			}
		},
		
		add: function(id){
			if(!id) return;
			
			var infos = this.getElementInfos(id);
			
			var path = this.getElementPath(id);
			
			if(infos.type == 'folder'){
				infos = this.getElementInfos(this.getParentElementId(id));
				
				var dirid = this.findDirId(infos.itemID, path);
				
				if(infos.type == 'scene' && !infos.isRoot){
					infos.type = 'entity';
					infos.itemID = id;
				}
			}
			else if(infos.isRoot){
				var dirid = this.findDirId(infos.itemID, path);
			}
			else{
				var dirid = this.findDirId(this.getParentElementId(id), path);
			}
			
			
			
			var collec = this.getTargetCollection(infos);
			
			var newId;
			var newEl;
			
			
			if(infos.type == 'component'){
				var newEl = new Component({path: path});
				collec.add(newEl, {silent: true});
			}
			else if(infos.type == 'entity'){
				var newEl = new Entity({path: path});
				collec.add(newEl, {silent: true});
			}
			else if(infos.type == 'scene'){
				var newEl = new Scene({path: path});
				newEl.get('entities').on('add remove', this.render, this);
				collec.add(newEl, {silent: true});
			}
			else if(infos.type == 'sprite'){
				var newEl = new Sprite({path: path});
				collec.add(newEl, {silent: true});
			}
			else if(infos.type == 'asset'){
				var newEl = new Asset({path: path});
				collec.add(newEl, {silent: true});
			}
			
			newEl.set('id', this.findFreeElementName(collec, "new_"+infos.type));
			var newId = this.insertChildElement(dirid, newEl, infos.type);
			
			this.el.editItem(newId);
		},
		
		rename: function(id, value){
		
			var infos = this.getElementInfos(id);
			
			if(infos.type != 'folder'){
				this.getTargetCollection(infos)
					.getByCid(infos.id)
						.set('id', value);
			}
			else{
				this.repath(id, this.getElementPath(id, true)+value+'/');
			}
			
			this.el.setItemText(id, value);
				
			return true;
		},
		
		repath: function(id, path){
			this.forEachChild(id, function(child){
				infos = this.getElementInfos(child);
				if(infos.type != 'folder'){
					
					this.getTargetCollection(infos)
					.getByCid(infos.id)
						.set('path', path);
				}
				else
					this.repath(child, path+this.el.getItemText(child)+'/');
			}, this);
		},
		
		mkdir: function(target, name){
			if(!target) return;
			if(typeof(name) == 'undefined') name = "new_folder";
			
			name = this.findFreeFolderName(target, name);
			
			var id = 'f '+getUniqID();
						
			this.el.insertNewChild(target, id, name,'','folderClosed.gif','','','',true);
			
			return id;
		},
		
		copy: function(src){
			if(!src) return;
			
			function copyOne(clipboard, id){
			
				var infos = this.getElementInfos(id);
			
				if(infos.type != 'folder' && !infos.isRoot){
					clipboard.elem = this.getTargetCollection(infos).getByCid(infos.id).clone();
				}
				else{
					clipboard.elem = this.el.getItemText(id);
					clipboard.children = copyChildren.call(this, id);
				}
				
			}
			
			function copyChildren(id){
				var children = new Array();
				
				this.forEachChild(id, function(child){
					var elem = {};
					copyOne.call(this, elem, child);
					children.push(elem);
				}, this);
				
				return children;
			}
			
			var type = this.getElementInfos(src).type;
			if(type == 'folder'){
				type = this.getElementInfos(this.getParentElementId(src)).type;
				if(type == 'scene' && !type.isRoot)
					type = 'entity';
			}
			this.clipboard = {
				type: type
			};
			
			copyOne.call(this, this.clipboard, src);
			
			this.contextMenu.setItemEnabled('paste');
			
		},
		
		paste: function(dst){
			var dInfos = this.getElementInfos(dst);
			
			var type = this.clipboard.type;
			
			if(dInfos.type == 'folder' && type == 'entity'){
				var pInfos = this.getElementInfos(this.getParentElementId(dst));
				if(pInfos.type == 'scene')
					dInfos.type = 'entity';
			}
			else if(dInfos.type == 'scene' && type == 'entity'){
				dInfos.type = 'entity';
			}
			else if(dInfos.type != 'folder' && !dInfos.isRoot){
				dst = this.el.getParentId(dst);
				dInfos = this.getElementInfos(dst);
			}
			
			var targetCollection = this.getTargetCollection(dInfos);
			
			function pasteOne(clip, item){
				if(clip.children){
					var dir = this.mkdir(item, this.findFreeFolderName(item, clip.elem));
					
					for(var i = 0 ; i < clip.children.length ; i++){
						pasteOne.call(this, clip.children[i], dir);
					}
				}
				else{
					//Makes sure new id is unique
					var elem = clip.elem.clone();
					elem.set('id', this.findFreeElementName(targetCollection, elem.id));
					elem.set('path', this.getElementPath(item));
					
					this.insertChildElement(item, elem, type);

					targetCollection.add(elem, {silent: true});
				}
			}
			
			pasteOne.call(this, this.clipboard, dst);
		},
		
		addChildEntity: function(sceneId){
			var ent = new Entity();
			var coll = this.model.get('scenes').getByCid(this.getElementInfos(sceneId).id).get('entities');
			
			ent.set('id', this.findFreeElementName.call(this, coll, "new entity"));
			coll.add(ent, {silent: true});
			
			this.el.insertNewChild(sceneId, 'e '+ent.cid, ent.id,'',iconsPath+'i_entity.png');
			this.el.editItem('e '+ent.cid);
		},
		
		insertChildElement: function(root, elem, type){
			
			var id = _.keys(types)[_.values(types).indexOf(type)]+' '+elem.cid;
			
			if(type == 'scene')
				this.el.insertNewChild(root, id, elem.id, '', iconsPath+'i_'+type+'.png', iconsPath+'i_'+type+'_o.png', iconsPath+'i_'+type+'.png');
			else
				this.el.insertNewChild(root, id, elem.id, '', iconsPath+'i_'+type+'.png');
			
			console.log(id);
			this.trigger('selected', type, this.getTargetCollection(id).getByCid(elem.cid));
			return id;
		},
		
		findFreeElementName: function(coll, name){
			var list = _.map(coll.models, function(m){
				return m.id;
				});
			
			var name2 = name;
			for(var i = 0 ; list.indexOf(name2) != -1 ; i++){
				name2 = name+'_'+i;
			}
			
			return name2;
		},
		
		//Tries to find a free name in current branch based on name (eg. name_xxx)
		findFreeFolderName: function(parentItem, name){
			
			var list = 	_.map(
							_.filter(this.el.getSubItems(parentItem).split(','),
							function(i){
								return this.getElementInfos(i).type == 'folder';
							}, this)
							
						, function(i){
							return this.el.getItemText(i);
						}, this);
			
			var name2 = name;
			for(var i = 0 ; list.indexOf(name2) != -1 ; i++){
				name2 = name+'_'+i;
			}
			
			return name2;
		},
		
		initContextMenu: function(){
			
			var _this = this;
			
			var menu = this.contextMenu = new dhtmlXMenuObject();
				
			var selectedId;
			
			menu.setIconsPath('lib/dhtmlx/imgs/');
			menu.renderAsContextMenu();
			menu.loadXML("app/ui/templates/projectCM.xml");
			
			menu.attachEvent("onClick", function(id, zoneid){
				
				//manipulating children while editing is a source of bugs
				_this.el.stopEdit();
				
				switch(id){
					case 'new':
						_this.add.call(_this, selectedId);
						break;
					case 'addChildEnt':
						_this.addChildEntity.call(_this, selectedId);
						break;
					case 'rename':
						_this.el.editItem(selectedId);
						break;
					case 'remove':
						_this.remove.call(_this, selectedId);
						break;
					case 'mkdir':
						_this.el.editItem(_this.mkdir.call(_this, selectedId));
						break;
					case 'refresh':
						_this.render.call(_this);
						break;
					case 'copy':
						_this.copy.call(_this, selectedId);
						break;
					case 'paste':
						_this.paste.call(_this, selectedId);
						break;
				}
			});

			this.el.attachEvent("onRightClick", function(id, object){
				if(id == 'settings'){
					menu.hideContextMenu();
					return;
				}
				
				var infos = _this.getElementInfos(id);
				
				if(infos.isRoot){
					menu.hideItem('remove');
					menu.hideItem('rename');
					menu.hideItem('addChildEnt');
					menu.showItem('mkdir');
				}
				else if(infos.type == "scene"){
					menu.showItem('remove');
					menu.showItem('rename');
					menu.showItem('addChildEnt');
					menu.showItem('mkdir');
				}
				else if(infos.type == "folder"){
					menu.showItem('remove');
					menu.showItem('rename');
					menu.showItem('mkdir');
					menu.hideItem('addChildEnt');
					
					infos = _this.getElementInfos(_this.getParentElementId(id));
					if(infos.type == 'scene' && !infos.isRoot)
						infos.type = 'entity';
				}
				else{
					menu.showItem('remove');
					menu.showItem('rename');
					menu.hideItem('addChildEnt');
					menu.hideItem('mkdir');
				}
				
				if(_this.checkPastePossible.call(_this, infos))
					menu.setItemEnabled('paste');
				else
					menu.setItemDisabled('paste');
				
				menu.setItemText('new', 'New '+infos.type);
				
				selectedId = id;
				menu.showContextMenu(object.clientX, object.clientY);
			});
		},
		
		checkPastePossible: function(infos){
			if(!infos) return;
			if(typeof(infos) == 'string')	infos = this.getElementInfos(infos);
			if(infos.type == 'folder')
				infos = this.getElementInfos(this.getParentElementId(infos.itemID));
			
			return (infos.type == this.clipboard.type) || (infos.type == 'scene' && this.clipboard.type == 'entity' && !infos.isRoot);
		},
		
		renderItem: function(type, item){
			var ret = {
				id: type+' '+item.cid,
				text: item.id,
				im0: iconsPath+'i_'+types[type]+'.png'
			};
			
			//If type is a scene, renders its entities
			if(type == 'sc'){
				ret.child = true;
				ret.open = true;
				ret.im2 = ret.im0;
				ret.im1 = iconsPath+'i_'+types[type]+'_o.png';
				
				ret.item = this.renderCollection('e', item.get('entities'));
				
			}
			
			return ret;
		},
		
		renderCollection: function(type, coll, root){
			if(!root) root = types[type];
			
			var nodes = [];
			coll.forEach(function(it){
				var dirs = _.compact(it.get('path').split('/'));
				
				//Creates dirs nodes according to path
				var node = nodes;
				
				for(var i = 0 ; i < dirs.length ; i++){
					var next = _.find(node, function(n){
						return n.text == dirs[i];
					});
					
					if(!next){
						next = {
							id: 'f '+getUniqID(),
							im0: 'folderClosed.gif',
							text: dirs[i],
							child: true,
							open: (i < dirs.length -1),
							item: new Array()
						};
						node.push(next);
					}
					node = next.item;
				}
				
				
 				node.push(this.renderItem(type, it));
				
			}, this);
			
			return nodes;
		},
			
		render: function(){
		
			//Get tree structure
			var tree = Treetemplate(
				iconsPath,
				this.renderCollection('e', this.model.get('entities')),
				this.renderCollection('c', this.model.get('components')),
				this.renderCollection('sc', this.model.get('scenes')),
				this.renderCollection('sp', this.model.get('sprites')),
				this.renderCollection('a', this.model.get('assets'))
			);
			
			//Cleans the tree
			this.el.deleteChildItems(0);
			
			//Then reloads contents
			this.el.loadJSONObject(tree);
		}
	});
	
});