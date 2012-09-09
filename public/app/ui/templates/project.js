define(function(){

	return function(
	
		iconsPath,
		entities,
		components,
		scenes,
		sprites,
		assets
	
	){
		return {
			id:0,
			item:[
				{
					id:'settings',
					text:"Settings", 
					im0:iconsPath+"i_settings.png"
				},
				{
					id:'entity', 
					text:"Entities",
					child: true,
					open: true,
					im0:iconsPath+"i_entities.png",
					im1:iconsPath+"i_entities.png",
					im2:iconsPath+"i_entities.png",
					item: entities
				},
				{
					id:'component', 
					text:"Components",
					child: true,
					open: true,
					im0:iconsPath+"i_components.png",
					im1:iconsPath+"i_components.png",
					im2:iconsPath+"i_components.png",
					item: components
				},
				{
					id:'scene', 
					text:"Scenes",
					child: true,
					open: true,
					im0:iconsPath+"i_scenes.png",
					im1:iconsPath+"i_scenes.png",
					im2:iconsPath+"i_scenes.png",
					item: scenes
				},
				{
					id:'sprite', 
					text:"Sprites",
					child: true,
					open: true,
					im0:iconsPath+"i_sprite.png",
					im1:iconsPath+"i_sprite.png",
					im2:iconsPath+"i_sprite.png",
					item: sprites
				},
				{
					id:'asset', 
					text:"Assets",
					child: true,
					open: true,
					im0:iconsPath+"i_assets.png",
					im1:iconsPath+"i_assets.png",
					im2:iconsPath+"i_assets.png",
					item: assets
				},
			]
		};
	};
});