define([
	'app/ui/dialogs/openDialog',
	'app/ui/dialogs/saveDialog',
	'dhtmlx'
], function(
	Open,
	Save
){
	return function(app, dhxWins){
		return {
			open: Open(app, dhxWins),
			save: Save(app, dhxWins)
		};
	};
});