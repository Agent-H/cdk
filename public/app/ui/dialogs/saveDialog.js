define([
	'bootstrap'
], function(
	Buttons
){
	return function(project){
		var modal = $('#saveDialog')
			.modal();
			
		modal.find('.yes_button')
			.click(function(){
				project.set('id', 'projects/0');
				project.save();
				modal.modal('hide');
			});
	};
});