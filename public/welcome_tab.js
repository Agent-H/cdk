$(function(){
	
	var selectTab = (function(){
		var nextEl;
		return function(tab){
			$('.welcome_tab_'+tab).parent().children('.active').removeClass('active');
			$('.welcome_tab_'+tab).addClass('active');
			
			nextEl = $('#welcome_'+tab);
			$('.welcome_browser > :visible').fadeOut(400, function(){;
				nextEl.fadeIn(400);
			});
		};
	})()
	
	$('.welcome_nav_button').click(function(){
		selectTab($(this).attr('data-nav'));
	});
	
	$('.welcome_pro_button').click(function(){
		app.models.project.set('id', $(this).attr('data-pro'));
		app.models.project.fetch();
	});
	
	if($('#welcome_projects > ul').is(':empty')){
		selectTab('examples');
	}
});