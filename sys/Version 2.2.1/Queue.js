!function(base){
	base.Queue = base.extend(base.Queue, {
	
		// the queue of all the application, it may change according to the dragging.
		queue: [],
		
		// the following three functions work for managing the queue of all apps.
		// besides it should be manage the app's position, and the position of widget attached to the app.
		switchQueue: function(from, to){
			var nthF = from-1, nthT = to-1;
			this.queue[nthF].style.left = (nthT%this.appsPerRow)*(100/this.appsPerRow)+"%";
			this.queue[nthF].style.top = Math.floor(nthT/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
			// relocate the widgets of an app which is just moved.
			if(this.queue[nthF].getAttribute("isWidget")){
				this.locateWidget(this.queue[nthF].id, this.queue[nthF].style.top, this.queue[nthF].style.left)
			}
			if(from != to){
				if(this.queue[nthT]){
					this.queue[nthT].style.left = (nthF%this.appsPerRow)*(100/this.appsPerRow)+"%";
					this.queue[nthT].style.top = Math.floor(nthF/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
					// relocate the widgets of an app which is just moved.
					if(this.queue[nthT].getAttribute("isWidget")){
						this.locateWidget(this.queue[nthT].id, this.queue[nthT].style.top, this.queue[nthT].style.left)
					}
				}
				var tmp = this.queue[nthT];
				this.queue[nthT] = this.queue[nthF];			
				this.queue[nthF] = tmp;					
			}
		},
		moveQueue: function(from, to){		
			var nthF = from-1, nthT = to-1;				
			this.queue[nthF].style.left = (nthT%this.appsPerRow)*(100/this.appsPerRow)+"%";
			this.queue[nthF].style.top = Math.floor(nthT/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
			// relocate the widgets of an app which is just moved.
			if(this.queue[nthF].getAttribute("isWidget")){
				this.locateWidget(this.queue[nthF].id, this.queue[nthF].style.top, this.queue[nthF].style.left)
			}
			if(from != to){
				this.queue[nthT] = this.queue[nthF];
				this.queue[nthF] = undefined;
			}
		},
		delQueue: function(from){
			this.queue[from-1] = undefined;
		},
	});
}(_Base_);