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
	})();
	
	function openProject(pro){
		app.models.project.open(pro);
		app.ui.MDIArea.closeWelcomeTab();
	}
	
	$('.welcome_nav_button').click(function(){
		selectTab($(this).attr('data-nav'));
	});
	
	$('.welcome_pro_button').click(function(){
		openProject($(this).attr('data-pro'));
	});
	
	if($('#welcome_projects > ul').length == 0){
		selectTab('examples');
	}
});