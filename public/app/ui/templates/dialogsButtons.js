define(function(){
	return function(buttons){
		var layout = new Array();
		for(var i = 0 ; i < buttons.length ; i++){
			layout.push({type: 'button', value:buttons[i], name:buttons[i]});
			layout.push({type:"newcolumn"});
		}
		
		return layout;
	}
});