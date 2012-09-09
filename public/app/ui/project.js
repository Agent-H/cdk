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
	
	//Returns item's type and ID
	function getElementInfos(itemID){
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
	}
	
	var getUniqID = (function(){
		var id = 0;
		return function(){return id++;};
	})();
	
	return Backbone.View.extend({
	
		initialize: function(){		
			var _this = this;
			
			this.tree = this.el.attachTree();
			this.tree.setIconsPath('lib/dhtmlx/imgs/');
			this.tree.enableItemEditor(true);
			this.tree.enableDragAndDrop(true, false);
			
			
			this.tree.attachEvent("onSelect", function(id){
				var infos = getElementInfos(id);
				
				if(!infos.isRoot && infos.type != 'folder'){
					_this.trigger('selected', infos.type, _this.getTargetCollection(infos).getByCid(infos.id));
					_this.trigger('selected:'+infos.type, _this.getTargetCollection(infos).getByCid(infos.id));
				}
			});
			
			
			/***	Drag-n-drop setup	***/
			
			this.tree.attachEvent("onBeforeDrag", function(sId){
				return !getElementInfos(sId).isRoot;
			});
			
			this.tree.attachEvent("onDrag", function(sId,tId,id,sObject,tObject){
				if(!_this.checkDrag.call(_this, sId, tId)){
					return false;
				}
				_this.onDrag.call(_this, sId,tId);
				
				return true;
			});
			
			this.tree.attachEvent("onDrop", function(sId,tId,id,sObject,tObject){
				/*if(!_this.checkDrag.call(_this, sId, tId)){
					return false;
				}*/
				return _this.onDrop.call(_this, sId,tId);
			});
			
			this.tree.attachEvent("onDragIn", function(dId,lId,sObject,tObject){
				return _this.checkDrag.call(_this, dId,lId);
			});
			
			
			/***	Edit setup	***/
			
			this.tree.attachEvent("onEdit", (function(){
				var correctVal = '';
				var prevVal = '';
				return function(state,id,tree,value){
					//Prevents editing of tree root elems
					if(state == 0){
						prevVal = value;
						return !getElementInfos(id).isRoot;
					}
					
					if(state == 2){
						if(value != prevVal){
							//On applique une v�rification
							if(value.indexOf(' ') != -1){
								correctVal = '';
								return false;
							}
						
						
							if(getElementInfos(id).type == 'folder')
								correctVal = _this.findFreeFolderName(_this.tree.getParentId(id), value);
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
			
			this.render();
		},
		
		checkDrag: function(sId,tId){
			var tInfos = getElementInfos(tId),
				sInfos = getElementInfos(sId);
			
			if(tInfos.isRoot){
				if(sInfos.type == 'folder'){
					pInfos = getElementInfos(this.getParentElementId(sId));
					return (pInfos.type == tInfos.type && !(pInfos.type == 'scene' && !pInfos.isRoot)) || (tInfos.type == 'entity' && pInfos.type == 'scene' && !pInfos.isRoot);
				}
				else
					return tInfos.type == sInfos.type;
			}
			
			if(tInfos.type == 'folder'){
				var pInfos = getElementInfos(this.getParentElementId(tId));
				
				if(sInfos.type == 'folder'){
					psInfos = getElementInfos(this.getParentElementId(sId));
					return (pInfos.type == psInfos.type)
						|| (psInfos.type == 'entity' && pInfos.type == 'scene' && !pInfos.isRoot)
						|| (pInfos.type == 'entity' && psInfos.type == 'scene' && !psInfos.isRoot);
				}
				else
					return (pInfos.type == sInfos.type && !(pInfos.type == 'scene' && !pInfos.isRoot)) || (pInfos.type == 'scene' && !pInfos.isRoot && sInfos.type == 'entity');
			}
			
			if(tInfos.type == 'scene'){
				if(sInfos.type == 'folder'){
					var pInfos = getElementInfos(this.getParentElementId(sId));
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
				infos = getElementInfos(this.tree.getParentId(infos.itemID));
			} while((infos.type == '' || infos.type == 'folder') && this.tree.getLevel(infos.itemID) > 1);
			
			return infos.itemID;
		},
		
		getElementPath: function(itemId, skipDir){
			if(!skipDir) skipDir = false;	//true : skips item if item is a dir
			
			var path = '/';
			var infos = getElementInfos(itemId);
			
			if(infos.type == 'folder' && !skipDir)
				path = '/'+this.tree.getItemText(itemId)+path;
					
			do{
				infos = getElementInfos(this.tree.getParentId(infos.itemID));
				if(infos.type == 'folder')
					path = '/'+this.tree.getItemText(infos.itemID)+path;
			} while((infos.type == '' || infos.type == 'folder') && this.tree.getLevel(infos.itemID) > 1);
			
			return path;
		},
		
		
		//Returns dir itemId based on path following the root 'root'
		findDirId: function(root, path){
			var dirs = _.compact(path.split('/'));
			
			var current = root;
			
			for(var i = 0 ; i < dirs.length ; i++){
				var subitems = _.compact(this.tree.getSubItems(current).split(','));
				
				var result = _.find(subitems, function(it){
					return this.tree.getItemText(it) == dirs[i];
				}, this);
								
				current = result;
			}
			
			return current;
		},
		
		getTargetModel: function(infos){
			
			if(infos.type != 'scene'){
				var pInfos = getElementInfos(this.getParentElementId(infos.itemID));
				
				if(pInfos.type == 'scene'){
					if(pInfos.isRoot)
						pInfos.id = infos.id;
					return this.model.get('scenes').getByCid(pInfos.id);
				}
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
				infos = getElementInfos(infos);
			}
			
			if(infos.type == 'folder'){
				infos = getElementInfos(this.getParentElementId(infos.itemID));
			}
			
			return this.getTargetModel(infos).get(model2collec[infos.type]);
		},
		
		//Applies function fn to each child of the specified elem(id)
		forEachChild: function(id, fn, ctx){
			var children = _.compact(this.tree.getSubItems(id).split(','));
			
			for(var i = 0 ; i < children.length ; i++){
				fn.call(ctx, children[i]);
			}
		},
		
		onDrop: function(sId, tId){
			var sInfos = getElementInfos(sId);
				
			if(sInfos.type != 'folder'){
				if(!this.dragCollection || !this.dropCollection){
					console.log("error : no drag or drop collection");
					return;
				}
				
				this.dropCollection = this.getTargetCollection(getElementInfos(sId));
				
				var elem = this.dragCollection.getByCid(sInfos.id);
				
				var clone = elem.clone();
				clone.set('path', this.getElementPath(tId));
				clone.set('id', this.findFreeElementName(this.dropCollection, clone.id));
				
				var cid = elem.cid;
				elem.destroy({silent: true});
				clone.cid = cid;
				
				this.dropCollection.add(clone, {silent: true});		
				this.tree.setItemText(sId, clone.id);
			}
			else{				
				this.forEachChild(sId, function(child){
					this.onDrop(child, sId);
				}, this);
			}
			
			return true;
		},
		
		//On cherche quelle collection va �tre pr�lev�e
		onDrag: function(sId, tId){
			var tInfos = getElementInfos(tId),
				sInfos = getElementInfos(sId);
				
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
			var infos = getElementInfos(id);
			
			if(infos.type != 'folder'){
				this.getTargetCollection(infos)
					.getByCid(infos.id)
						.destroy({silent: true});
				this.tree.deleteItem(id);
			}
			else{
				this.forEachChild(id, this.remove, this);
				this.tree.deleteItem(id);
			}
		},
		
		add: function(id){
			var infos = getElementInfos(id);
			
			var path = this.getElementPath(id);
			
			if(infos.type == 'folder'){
				infos = getElementInfos(this.getParentElementId(id));
				
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
			
			newEl.set('id', this.findFreeElementName(collec, "new "+infos.type));
			var newId = this.insertChildElement(dirid, newEl, infos.type);
			
			this.tree.editItem(newId);
		},
		
		rename: function(id, value){
		
			var infos = getElementInfos(id);
			
			if(infos.type != 'folder'){
				this.getTargetCollection(infos)
					.getByCid(infos.id)
						.set('id', value);
			}
			else{
				this.repath(id, this.getElementPath(id, true)+value+'/');
			}
			
			this.tree.setItemText(id, value);
				
			return true;
		},
		
		repath: function(id, path){
			this.forEachChild(id, function(child){
				infos = getElementInfos(child);
				if(infos.type != 'folder'){
					
					this.getTargetCollection(infos)
					.getByCid(infos.id)
						.set('path', path);
				}
				else
					this.repath(child, path+this.tree.getItemText(child)+'/');
			}, this);
		},
		
		mkdir: function(target, name){
			if(typeof(name) == 'undefined') name = "new_folder";
			
			name = this.findFreeFolderName(target, name);
			
			var id = 'f '+getUniqID();
						
			this.tree.insertNewChild(target, id, name,'','folderClosed.gif','','','',true);
			
			return id;
		},
		
		copy: function(src){
			
			function copyOne(clipboard, id){
			
				var infos = getElementInfos(id);
			
				if(infos.type != 'folder' && !infos.isRoot){
					clipboard.elem = this.getTargetCollection(infos).getByCid(infos.id).clone();
				}
				else{
					clipboard.elem = this.tree.getItemText(id);
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
			
			var type = getElementInfos(src).type;
			if(type == 'folder'){
				type = getElementInfos(this.getParentElementId(src)).type;
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
			var dInfos = getElementInfos(dst);
			
			var type = this.clipboard.type;
			
			if(dInfos.type == 'scene' && type == 'entity'){
				dInfos.type = 'entity';
			}
			else if(dInfos.type != 'folder' && !dInfos.isRoot){
				dst = this.tree.getParentId(dst);
				dInfos = getElementInfos(dst);
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
		
		insertChildElement: function(root, elem, type){
			
			var id = _.keys(types)[_.values(types).indexOf(type)]+' '+elem.cid;
			
			if(type == 'scene')
				this.tree.insertNewChild(root, id, elem.id, '', iconsPath+'i_'+type+'.png', iconsPath+'i_'+type+'_o.png', iconsPath+'i_'+type+'.png');
			else
				this.tree.insertNewChild(root, id, elem.id, '', iconsPath+'i_'+type+'.png');
				
				
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
							_.filter(this.tree.getSubItems(parentItem).split(','),
							function(i){
								return getElementInfos(i).type == 'folder';
							}, this)
							
						, function(i){
							return this.tree.getItemText(i);
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
				_this.tree.stopEdit();
				
				switch(id){
					case 'new':
						_this.add.call(_this, selectedId);
						break;
					case 'addChildEnt':
						var ent = new Entity();
						var coll = _this.model.get('scenes').getByCid(getElementInfos(selectedId).id).get('entities');
						
						ent.set('id', _this.findFreeElementName.call(_this, coll, "new entity"));
						coll.add(ent, {silent: true});
						
						_this.tree.insertNewChild(selectedId, 'e '+ent.cid, ent.id,'',iconsPath+'i_entity.png');
						_this.tree.editItem('e '+ent.cid);
						break;
					case 'rename':
						_this.tree.editItem(selectedId);
						break;
					case 'remove':
						_this.remove.call(_this, selectedId);
						break;
					case 'mkdir':
						_this.tree.editItem(_this.mkdir.call(_this, selectedId));
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

			this.tree.attachEvent("onRightClick", function(id, object){
				if(id == 'settings'){
					menu.hideContextMenu();
					return;
				}
				
				var infos = getElementInfos(id);
				
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
					
					infos = getElementInfos(_this.getParentElementId(id));
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
			if(infos.type == 'folder')
				infos = getElementInfos(this.getParentElementId(infos.itemID));
			
			return (infos.type == this.clipboard.type) || (infos.type == 'scene' && this.clipboard.type == 'entity');
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
							open: true,
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
			this.tree.deleteChildItems(0);
			
			//Then reloads contents
			this.tree.loadJSONObject(tree);
		}
	});
	
});