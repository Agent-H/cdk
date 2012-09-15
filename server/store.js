var fs = require('fs');

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
		res.sendfile(req.params.dir + '/' + req.params.name + '/'+req.params.name+'.json', {root: __dirname + '/../store/'});
	},
	
	getIndex: function(req, res){
		exports.getAll(function(err, list){
			if(err)
				res.end('error');
			
			res.end(JSON.stringify(list));
		});
	}
};