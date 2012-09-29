
/** Compiler.js	**/

define([
	'backbone'
], function(){

	return Backbone.Model.extend({
		defaults:{
			render: {
				loader: '',
				core: ''
			},
			built: false
		},
		
		initialize: function(){
			
		},
		
		build: function(project, settings){
			var render = this.get('render');
			
			var ret = true;
			
			function onError(err){
				console.log("Build error : "+err);
				ret = false;
			}
			
			this.on('error', onError);
			
			render.loader = this.makeLoader(project, settings);
			
			render.core = "var Game = {";
			render.core += "init: function(){";
			render.core += this.makeGlobal(project);
			render.core += this.makeAssets(project);
			render.core += this.makeSprites(project);
			render.core +="}};";
			
			
			this.off('error', onError);
			
			built = ret;
			return ret;
		},
		
		makeGlobal: function(project){
			return 	"Crafty.init(640, 	"+
					"		  480  		"+
					"		  );		"+

					"Crafty.canvas.init();  ";
		},
		
		makeSprites: function(project){
			var str = '';
			var sprites = project.attributes.sprites.models;
			
			for(var i = 0 ; i < sprites.length ; i++){
				str += "Crafty.sprite('"+sprites[i].get('image')+"', { ";
				
				var j = 0;
				str += _.map(sprites[i].get('sprites'), function(s){
					var name = s.get('name');
					if(name)
						return 's_'+name+": ["+s.get('x')+","+s.get('y')+", "+s.get('w')+", "+s.get('h')+"]";
					else
						this.trigger('error', 'Sprites must have a name.\n\tIn sprite "'+sprites[i].id+'", n="'+j+'"');
					
					j++;
				}, this).join(',');
				
				str += "});";
			};
			
			str+="Crafty.e('s_blah, 2D, Canvas, Twoway')"+
				".attr({x: 430, y: 432, w: 48, h: 48}).twoway(3);";
			return str;
		},
		
		makeAssets: function(project){
			//Creates an array containing every dataURI
			var str = "var assets = {"+project.attributes.assets.map(function(val, key){
				return val.id+':"'+val.get('dataURI')+'"';
			}, this).join(',')+"};";
			
			str += 	"for(var i in assets){			"+
					"	var img = new Image();		"+
					"	img.src = assets[i];		"+
					"	Crafty.asset(i, img);		"+
					"}";
			
			return str;
		},
		
		makeLoader: function(project, settings){
			var str = "(function(){													\
				var total = 0;															\
				var done = 0;															\
																						\
				function onLoad(){														\
					done ++;															\
					if(done == total){													\
						loadEnd();														\
					}											\
					return true;					\
				}																		\
																						\
				function loadEnd(){														\
					Game.init();						\
				}																		\
																						\
				function load(src, dir){												\
					total++;															\
																						\
					dir = '"+settings.root+"'+dir;										\
					var script = document.createElement('script');						\
					script.type = 'text/javascript';									\
					script.onload = onLoad;											\
					script.src = dir+'/'+src+'.js';										\
					document.getElementsByTagName('head')[0].appendChild(script);		\
				}";
				
			if(settings.test){
				str += "load('crafty-min', 'lib');";
			}
			else
				str += "load('crafty-min');";
			
			str += "})();";
			
			return str;
		}
	});
});