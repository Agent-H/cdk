define(['dhtmlx', 'jquery', 'underscore'], function(){
	return function(dhxWins){
		return function(){
			var win = dhxWins.createWindow('openDialog', 100, 100, 400, 300);
			win.setModal(true);
			
			$.get('store/', function(data){
				console.log('success');
				var tree = win.attachTree();
				
				var id = 1;
				
				var items= _.map(JSON.parse(data), function(elem, key){
					return {	id: id++,
							text: key,
							im0: 'folderClosed.gif',
							item: _.map(elem, function(el){
								return {
									id: id++,
									text: el
								};
							})
						}
				});
				
				tree.loadJSONObject({
					id:0,
					item: items
				});
			});
		};
	};
});