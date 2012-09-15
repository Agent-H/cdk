define(function(){
	return function(buttons){
		var layout = new Array();
		for(var i = 0 ; i < buttons.length ; i++){
			if(i != 0)
				layout.push({type:"newcolumn"});
			layout.push({type: 'button', value:buttons[i], name:buttons[i], position: 'absolute'});
		}
		layout[layout.length-1].inputLeft = 90;
		return layout;
	}
});