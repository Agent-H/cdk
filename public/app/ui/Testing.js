define(['backbone'], function(){
	
	return Backbone.View.extend({
	
		initialize: function(){
			var _this = this;
			
			this.$el.hide();
			
			this.window = window.testingFrame;
			
			this.$el.find('#closeTest').click(function(){
				_this.abort.call(_this);
			});
		},
		
		test: function(){
			var compiler = app.models.compiler;
			var project = app.models.project;
			
			if(compiler.build(project, {root: '/', test: true})){
				var render = compiler.get('render');
				
				this.window.document.body.innerHTML = '';
				this.window.document.write('<html><head></head><body><script type="text/javascript">'+render.loader+'</script>' +
					'<script type="text/javascript">'+render.core+'</script></body></html>');
				this.$el.show();
			}
		},
		
		abort: function(){
			this.$el.hide();
		}
	});
});