require.config({
	baseUrl: "/",
	paths: {
		"underscore": "lib/underscore-min",
		"backbone": "lib/backbone-min",
		"jquery": "lib/jquery-min",
		"crafty": 'lib/crafty-min.js',
		"dhtmlx": 'lib/dhtmlx/dhtmlx',
		"bootstrap": 'lib/bootstrap.min'
	},
	shim: {
		'backbone': {
			//These script dependencies should be loaded before loading
			//backbone.js
			deps: ['underscore', 'jquery'],
			//Once loaded, use the global 'Backbone' as the
			//module value.
			exports: 'Backbone'
		},
		
		'bootstrap': {
			deps: ['jquery']
		}
	}
});