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
	
	save: function(data, cb){
		
	},
	
	getProject: function(req, res){
		if(checkCategory(req, res))
			res.sendfile(req.params.cat + '/' + req.params.id+'/project.json', {root: __dirname + '/../store/'});
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
		
		function doSave(){
			var pro = req.body;
			
			delete pro.id;	//We don't want to save project's id
			
			fs.writeFile(__dirname + '/../store/projects/'+req.params.id+'/project.json', JSON.stringify(pro), function (err) {
				if (err)
					res.end('error');
					
				res.end('{}');
			});
		}
		
		if(req.params.cat == 'projects'){
			fs.exists(__dirname + '/../store/projects/'+req.params.id, function (exists) {
				if(!exists)
					fs.mkdir(__dirname + '/../store/projects/'+req.params.id, 0777, doSave);
				else
					doSave();
			});
		}
		else
			res.end('error: User can only save projects');
	}
};
