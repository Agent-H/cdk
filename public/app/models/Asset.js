define([
	'app/models/Element'
], function(
	Element
){

	return Element.extend({
		defaults: _.extend({},Element.prototype.defaults, {
			dataURI: '',
			name: '',
			type: ''
		}),
		
		initialize: function(){
		},
		
		isImage: function(){
			return (this.get('dataURI').substr(0, 10) == 'data:image');
		},
		
		isAudio: function(){
			return (this.get('dataURI').substr(0, 10) == 'data:audio');
		},
		
		isValid: function(){
			return (this.isImage || this.isValid);
		}
	});
	
});