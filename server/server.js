
var express = require('express'),
	store = require('./store'),
	app = express();

app.set('views', __dirname + '/../views');
app.set('view engine', 'jade');

app.use(app.router);
app.use(express.static(__dirname+'/../public'));

app.get('/welcome_tab.html', function(req, res){
	res.render('welcome_tab', {
		layout: false
	});
});

app.get('/store/:dir/:name', store);

app.listen(5000);

console.log("Server listening on port 5000.");