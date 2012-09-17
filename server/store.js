var fs = require('fs');

var categories = [
	'projects',
	'templates',
	'examples'
];

function checkCategory(req, res){
	if(categories.indexOf(req.params.cat) != -1)
		return true;
	
	res.end('error: unknown category');
	return false;
}

var exports = module.exports = {
	getAll: function(cb){
		
		var collected = {
			projects: false,
			templates: false,
			examples: false
		};
		
		var error;
		
		var collector = function(type){
			return function(err, list){
				collected[type] = list;
				
				if(err){
					error = err;
					collected[type] = true;
				}
				
				if(collected.projects && collected.templates && collected.examples){
					cb(error, collected);
				}
			}
		};
		
		fs.readdir(__dirname + '/../store/projects/', collector('projects'));
		fs.readdir(__dirname + '/../store/templates/',  collector('templates'));
		fs.readdir(__dirname + '/../store/examples/',  collector('examples'));
	
	},
	
	getProject: function(req, res){
		if(checkCategory(req, res)){
			fs.readdir(__dirname + '/../store/projects/', function(err, list){
				for(var i = 0 ; i < list.length ; i++){
					if(list[i].split('.')[0] == req.params.id){
						res.sendfile(req.params.cat + '/' + list[i]+'/project.json', {root: __dirname + '/../store/'});
						return;
					}
				}
				
			});
		}
	},
	
	getIndex: function(req, res){
		exports.getAll(function(err, list){
			if(err)
				res.end('error');
			
			res.end(JSON.stringify(list));
		});
	},
	
	getCategory: function(req, res){
		if(checkCategory(req, res)){
			fs.readdir(__dirname + '/../store/'+req.params.cat+'/', function(err, list){
				if(err)
					res.end('error');
				else{
					res.end(JSON.stringify(list));
				}
			});
		}
	},
	
	saveProject: function(req, res){
		
		if(!req.body){
			res.end('no body sent');
			return;
		}
		
		function doSave(name){
			var pro = req.body;
			
			delete pro.id;	//We don't want to save project's id
			
			//Project has been renamed
			if(pro.title != name){
				fs.rename(__dirname + '/../store/projects/'+req.params.id+'.'+name, 
						__dirname + '/../store/projects/'+req.params.id+'.'+pro.title,
						
				function(err){
					if(err)
						res.end("error, can't rename");
					else
						save();
				});
			}
			else
				save();
			
			function save(){
				fs.writeFile(__dirname + '/../store/projects/'+req.params.id+'.'+pro.title+'/project.json', JSON.stringify(pro), function (err) {
					if (err)
						res.end('error');
						
					res.end('{"id":"projects/'+req.params.id+'"}');
				});
			}
		}
		
		if(req.params.cat == 'projects'){
			fs.readdir(__dirname + '/../store/projects/', function(err, list){
				if(err)
					res.end("error can't read dir");
				else{
					//The project is new
					if(req.params.id == 0){
						//The list is transformed into an array of used ids
						var ids = new Array();
						
						
						for(var i = 0 ; i < list.length ; i++){
							ids.push(parseInt(list[i].split('.')[0]));
						}
						
						//Looking for a free id
						var i;
						for(i = 1 ; ids.indexOf(i) != -1 ; i++){
						}
						
						fs.mkdir(__dirname + '/../store/projects/'+i+'.'+req.body.title, function(err){
							if(err){
								res.end("error, can't make dir");
							}
							else{
								req.params.id = i;
								
								doSave(req.body.title);
							}
						});
					}
					else{
						//Searching complete name of the project
						for(var i = 0 ; i < list.length ; i++){
							if(list[i].split('.')[0] == req.params.id){
								doSave(list[i].split('.')[1]);
								return;
							}
						}
						
						res.end("error, can't find remote project");
					}
				}
			});
		}
		else
			res.end('error: User can only save projects');
	},
	
	upload: function(req, res) {
		console.log( req.files );
		
		if(req.params.id == 0){
			res.send('<script type="text/javascript">error = "Asset can\'t be uploaded : save project first.";</script>');
		}
		else{
			res.send('<script type="text/javascript">file = { \
				 name: "'+req.files.data.name+'"\
				,type: "'+req.files.data.type+'"\
			}</script>');
		}
		// use fs.rename to move the file and unlink after that
	}
};
