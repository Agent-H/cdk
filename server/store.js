module.exports = function(req, res){
	res.sendfile(req.params.dir + '/' + req.params.name + '/'+req.params.name+'.json', {root: __dirname + '/../store/'});
};