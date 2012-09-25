!function(base){

	var App = base.App,
		Drive = base.Drive,
		Tray = base.Tray,
		Box = base.Box;

	base.Queue = base.extend(base.Queue, {
	
		// the queue of all the application, it may change according to the dragging.
		queue: [],
		
		// the following three functions work for managing the queue of all apps.
		// besides it should be manage the app's position, and the position of widget attached to the app.
		switchQueue: function(from, to){
			var nthF = from-1, nthT = to-1;
			base.Queue.queue[nthF].style.left = (nthT % base.Config.appsPerRow)*(100/base.Config.appsPerRow)+"%";
			base.Queue.queue[nthF].style.top = Math.floor(nthT/base.Config.appsPerColumn)*100/(base.Page.pagesCount*base.Config.appsPerColumn)+"%";
			// relocate the widgets of an app which is just moved.
			base.Widget.locateWidget(base.Queue.queue[nthF].id, base.Queue.queue[nthF].style.top, base.Queue.queue[nthF].style.left);
			if(from != to){
				if(base.Queue.queue[nthT]){
					base.Queue.queue[nthT].style.left = (nthF % base.Config.appsPerRow) * (100 / base.Config.appsPerRow)+"%";
					base.Queue.queue[nthT].style.top = Math.floor(nthF/base.Config.appsPerColumn)*100/(base.Page.pagesCount*base.Config.appsPerColumn)+"%";
					// relocate the widgets of an app which is just moved.
					base.Widget.locateWidget(base.Queue.queue[nthT].id, base.Queue.queue[nthT].style.top, base.Queue.queue[nthT].style.left);
				}
				var tmp = base.Queue.queue[nthT];
				base.Queue.queue[nthT] = base.Queue.queue[nthF];			
				base.Queue.queue[nthF] = tmp;					
			}
		},
		moveQueue: function(from, to){		
			var nthF = from-1, nthT = to-1;				
			base.Queue.queue[nthF].style.left = (nthT%base.Config.appsPerRow)*(100/base.Config.appsPerRow)+"%";
			base.Queue.queue[nthF].style.top = Math.floor(nthT/base.Config.appsPerColumn)*100/(base.Page.pagesCount*base.Config.appsPerColumn)+"%";
			// relocate the widgets of an app which is just moved.
			base.Widget.locateWidget(base.Queue.queue[nthF].id, base.Queue.queue[nthF].style.top, base.Queue.queue[nthF].style.left);
			if(from != to){
				base.Queue.queue[nthT] = base.Queue.queue[nthF];
				base.Queue.queue[nthF] = undefined;
			}
		},
		delQueue: function(from){
			base.Queue.queue[from-1] = undefined;
		},
	});
	
	_Base_ = base;
}(_Base_);