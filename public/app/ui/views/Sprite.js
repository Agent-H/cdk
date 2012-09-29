define([
	'backbone',
	'kinetic'
], function(){
	
	var Template;
	
	var previewMargin = 20;
	
	$.get('app/ui/templates/spriteForm.html',  function(template){
		Template = template;
	});
	
	return Backbone.View.extend({
	
		initialize: function(){		
			var layout = this.el.attachLayout('2U');
			layout.setAutoSize("a", "a;b");
			
			this.previewCell = layout.cells('a');
			this.previewCell.setText('Preview');
			
			this.settingsCell = layout.cells('b');
			this.settingsCell.setText('Settings');
			this.settingsCell.setWidth('300');
			
			this.on('onClose', function(){
				this.model.off('change', this.render, this);
			}, this);
			
			this.initTemplate();
			
			this.model.on('newSprite', this.addSprite, this);
			
			this.render();
		},
		
		initTemplate: function(){
			var _this = this;
			
			var template = $(Template);
			
			this.form = template.filter('.propertyForm');
			
			this.spriteLabel = template.filter('.spriteLabel');
			
			template.find('.spriteImage')
				.val(this.model.get('image'))
				.change(function(){
				_this.model.set('image', $(this).val());
				_this.renderPreview.call(_this);
			});
			
			this.form.find('[data-add="true"]').click(function(){
				_this.model.addSprite();
			});
		},
		
		renderSettings: function(){
			var _this = this;
			var sprite = this.model;
			
			this.settingsCell.attachObject(this.form.get()[0]);
		},
		
		addSprite: function(sprite){
			var _this = this;
			
			
			// *** Serttings label render ***//
			
			var label = this.spriteLabel.clone();
			
			function updateLabel() {
				label.find('[data-coord="x"]').val(sprite.get('x'));
				label.find('[data-coord="y"]').val(sprite.get('y'));
				label.find('[data-coord="w"]').val(sprite.get('w'));
				label.find('[data-coord="h"]').val(sprite.get('h'));
				label.find('.spriteName').val(sprite.get('name'));
			}
			
			function select(){
				label.parent().children('.selected').removeClass('selected');
				label.addClass('selected');
				
				if(_this.selected)
					_this.selected.trigger('unselect');
				_this.selected = sprite;
				
				sprite.trigger('select');
			}
			
			label
			.click(select)
			.mouseenter(function(){
				sprite.trigger('hover');
			})
			.mouseleave(function(){
				sprite.trigger('unhover');
			})
			.find('[data-remove="true"]').click(function(){
				var sprites = _this.model.get('sprites');
				delete sprites[sprites.indexOf(sprite)];
				_this.model.set('sprites', _.compact(sprites));
				group.removeChildren();
				layer.draw();
				label.remove();
			});
			label.find('[data-minus="true"]').click(function(){
				label.find('.coordsInputs').toggle();
			});
			label.find('[data-coord="x"]').change(function(){sprite.set('x', $(this).val());});
			label.find('[data-coord="y"]').change(function(){sprite.set('y', $(this).val());});
			label.find('[data-coord="w"]').change(function(){sprite.set('w', $(this).val());});
			label.find('[data-coord="h"]').change(function(){sprite.set('h', $(this).val());});
			label.find('.spriteName').change(function(){sprite.set('name', $(this).val());});
			
			this.form.find('.spritesList').append(label);
			
			updateLabel();
			select();
			
			sprite.on('change', updateLabel, this);
			/*** Preview render ***/
			
			var layer = this.rectsLayer;
			
			var group = new Kinetic.Group({
				x: 0,
				y: 0,
				draggable: true
			});
			
			layer.add(group);
			
			sprite.on('change', updateGroup);
			group.on('dragmove', function() {
				sprite.set({x: topLeft.attrs.x+group.attrs.x - previewMargin, y: topLeft.attrs.y+group.attrs.y - previewMargin});
			});
			
			function updateGroup(){
				var x = parseInt(sprite.get('x')), y = parseInt(sprite.get('y')),
					w = parseInt(sprite.get('w')), h = parseInt(sprite.get('h'));
				var bx = group.attrs.x + topLeft.attrs.x - previewMargin,
					by = group.attrs.y + topLeft.attrs.y - previewMargin,
					bw = topRight.attrs.x - topLeft.attrs.x,
					bh = bottomLeft.attrs.y - topLeft.attrs.y;
					
				if(x != bx || y != by){
					group.setPosition(previewMargin + x - topLeft.attrs.x, previewMargin + y - topLeft.attrs.y);
				}
				if(w != bw || h != bh){
					bottomRight.setPosition(topLeft.attrs.x + w, topLeft.attrs.y + h);
					onAnchorMove(bottomRight);
				}
				
				layer.draw();
			}
			
			function onAnchorMove(activeAnchor){
			
				// update anchor positions
				switch (activeAnchor.getName()) {
					case 'topLeft':
						topRight.attrs.y = activeAnchor.attrs.y;
						bottomLeft.attrs.x = activeAnchor.attrs.x;
						break;
					case 'topRight':
						topLeft.attrs.y = activeAnchor.attrs.y;
						bottomRight.attrs.x = activeAnchor.attrs.x;
						break;
					case 'bottomRight':
						bottomLeft.attrs.y = activeAnchor.attrs.y;
						topRight.attrs.x = activeAnchor.attrs.x;
						break;
					case 'bottomLeft':
						bottomRight.attrs.y = activeAnchor.attrs.y;
						topLeft.attrs.x = activeAnchor.attrs.x;
						break;
				}
				
				rect.setPosition(topLeft.attrs.x, topLeft.attrs.y);
				
				var width = topRight.attrs.x - topLeft.attrs.x;
				var height = bottomLeft.attrs.y - topLeft.attrs.y;
				if(width && height) {
					rect.setSize(width, height);
					sprite.set({x: topLeft.attrs.x+group.attrs.x - previewMargin, y: topLeft.attrs.y+group.attrs.y - previewMargin, w: width, h: height});
				}
				else
					sprite.set({x: topLeft.attrs.x+group.attrs.x - previewMargin, y: topLeft.attrs.y+group.attrs.y - previewMargin});
			}
			
			function makeAnchor(x, y, name){
				var anchor = new Kinetic.Circle({
					x: x,
					y: y,
					stroke: 'rgb(100, 100, 200)',
					fill: 'rgba(150, 150, 220, .6)',
					strokeWidth: 2,
					radius: 4,
					name: name,
					draggable: true
				});
				
				anchor.on('dragmove', function() {
					onAnchorMove(this);
					layer.draw();
				});
				anchor.on('mousedown touchstart', function() {
					group.setDraggable(false);
					this.moveToTop();
				});
				anchor.on('dragend', function() {
					group.setDraggable(true);
					layer.draw();
				});
				anchor.on('mouseover', function() {
					document.body.style.cursor = 'pointer';
					this.setStrokeWidth(4);
					this.setRadius(7);
					layer.draw();
				});
				anchor.on('mouseout', function() {
					document.body.style.cursor = 'default';
					this.setStrokeWidth(2);
					this.setRadius(4);
					layer.draw();
				});
				
				group.add(anchor);
				return anchor;
			}
			
			function makeRect(x, y, w, h){
				var rect = new Kinetic.Rect({
					x: x,
					y: y,
					width: w,
					height: h,
					stroke: 'rgba(0, 0, 255, .9)',
					fill: 'rgba(100, 100, 255, .2)',
					strokeWidth: 1
				});
				
				group.add(rect);
				
				return rect;
			}
			
			var left = sprite.get('x'), top = sprite.get('y');
			var right = sprite.get('w')+left, bottom = sprite.get('h')+top;
	
			var rect = makeRect(left, top, right-left, bottom-top);

			var topLeft = makeAnchor(left,top, 'topLeft');
			var bottomLeft = makeAnchor(left,bottom, 'bottomLeft');
			var topRight = makeAnchor(right,top, 'topRight');
			var bottomRight = makeAnchor(right,bottom, 'bottomRight');			
			
			layer.draw();
			
			var isSelected = true;
			sprite.on('unselect', function(){
				group.hide();
				layer.draw();
				isSelected=  false;
			})
			.on('select', function(){
				group.show();
				layer.draw();
				isSelected = true;
			})
			.on('hover', function(){
				if(!isSelected){
					rect.setFill('rgba(255, 100, 100, .2)');
					rect.setStroke('rgba(255, 0, 0, .9)');
					topLeft.hide();
					bottomLeft.hide();
					topRight.hide();
					bottomRight.hide();
					group.show();
				}
				layer.draw();
			})
			.on('unhover', function(){
				if(!topLeft.isVisible()){
					topLeft.show();
					bottomLeft.show();
					topRight.show();
					bottomRight.show();
					rect.setFill('rgba(100, 100, 255, .2)');
					rect.setStroke('rgba(0, 0, 255, .9)');
					if(!isSelected){
						group.hide();
					}
					layer.draw();
				}
			});
			
			updateGroup();
		},
		
		renderPreview: function(){
			this.previewCell.detachObject();
			
			var _this = this;
			var sprite = this.model;
			
			this.updateImage();
			
			if(this.image){
				if(this.image.isImage()){
					var container = $('<div />').get()[0];
					this.previewCell.attachObject(container);
					
					stage = new Kinetic.Stage({
						container: container,
						width: 578,
						height: 363
					});
					
					var layer = new Kinetic.Layer();
					this.rectsLayer = new Kinetic.Layer();
					
					stage.add(layer);
					stage.add(this.rectsLayer);
					
					var image = new Image();
					
					image.onload = function(){
						var kimg = new Kinetic.Image({
							x: previewMargin,
							y: previewMargin,
							image: image,
							name: 'image'
						});
						stage.setWidth(image.width + 2*previewMargin);
						stage.setHeight(image.height + 2*previewMargin);
						layer.add(kimg);
						
						layer.draw();
					}
					
					image.src = this.image.get('dataURI');

				}
				else
					this.previewCell.attachObject($('<div class="alert alert-error">Ressource is not an image</div>').get()[0]);
			}
		},
		
		render: function(){
			this.renderSettings();
			this.renderPreview();
			
			var sprites = this.model.get('sprites');
			for(var i = 0 ; i < sprites.length ; i++){
				this.addSprite(sprites[i]);
			}
			
		},
		
		updateImage: function(){
			if(this.image)
				this.image.off('change', this.renderPreview, this);
			
			this.image = this.options.project.get('assets').get(this.model.get('image'));
			
			if(this.image)
				this.image.on('change', this.renderPreview, this);
		}
	});
});