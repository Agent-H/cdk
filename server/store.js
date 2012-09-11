var fs = require('fs');

module.exports = {
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
				
				if(err)
					error = err;
					
				if(collected.projects && collected.templates && collected.examples){
					cb(error, collected);
				}
			}
		};
		
		fs.readdir(__dirname + '/../store/projects/', collector('projects'));
		fs.readdir(__dirname + '/../store/templates/',  collector('templates'));
		fs.readdir(__dirname + '/../store/examples/',  collector('examples'));
	
	},
	
	route: function(req, res){
		res.sendfile(req.params.dir + '/' + req.params.name + '/'+req.params.name+'.json', {root: __dirname + '/../store/'});
	}
};