
var express = require('express'),
	store = require('./store'),
	app = express();

app.set('views', __dirname + '/../views');
app.set('view engine', 'jade');

app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(__dirname+'/../public'));

app.get('/welcome_tab.html', function(req, res){
	store.getAll(function(err, data){
		if(!err){
			res.render('welcome_tab', {
				layout: false,
				projects: data.projects,
				templates: data.templates,
				examples: data.examples
			});
		}
		else
			res.end('error');
	});
});

app.get('/store/:cat/:id', store.getProject);
app.get('/store/', store.getIndex);
app.get('/store/:cat', store.getCategory);
app.put('/store/:cat/:id', store.saveProject);

app.post('/store/upload/:cat/:id', store.upload);

app.listen(5000);

console.log("Server listening on port 5000.");