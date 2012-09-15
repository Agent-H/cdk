define([
	'app/ui/dialogs/openDialog',
	'dhtmlx'
], function(
	Open
){
	return function(app, dhxWins){
		return {
			open: Open(app, dhxWins)
		};
	};
});