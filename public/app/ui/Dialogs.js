define([
	'app/ui/dialogs/openDialog',
	'dhtmlx'
], function(
	Open
){
	return function(dhxWins){
		return {
			open: Open(dhxWins)
		};
	};
});