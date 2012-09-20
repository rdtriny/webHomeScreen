!function(base){	
	//
	// logic about the favorite tray, a fixed area containing some apps, which is a quich launch for these apps 
	// Fucntions related to the tray:
	// 		1. Move apps into the tray
	//		2. Move apps out of the tray
	//		3. manage the widget's open/close event of the moved apps.
	//		4. create the tray, and add it to the screen.
	//
	base.Tray = base.extend(base.Tray, {
		// some public variables.
		Var: {
			tray: null,
			targetMem: null,
			actionIn: false,
			actionOut: false
		},
		addFixedArea: function(){
			var div = document.createElement("div");
			div.style.width = "100%";
			div.style.height = "16%";
			div.style.position = "absolute";
			div.style.bottom = "0";
			div.style.left = "0";
			div.style.backgroundColor = "black";
			div.style.opacity = "0.6";
			div.style.borderTop = "1px solid #F0FFF0";
			div.id = "tray";
			base.Tray.Var.tray = div;
			document.body.appendChild(div);		
		},
		moveInTray: function(){
			var target = this.target.cloneNode(true);
			target.style.top = "0";
			target.style.height = "100%";
			target.style.width = "20%";
			base.Tray.Var.tray.appendChild(target);
			this.target.style.display = "none";
			base.Tray.Var.actionIn = true;			
			base.Tray.Var.targetMem = target;
			if(base.Tray.checkFull()){
				this.to = this.from;
			}
		},
		endToIn: function(pagey){
			if(pagey>=this.iconHeight*4 && (!base.Tray.checkFull())){
				this.delQueue(this.from);
				this.container.removeChild(this.target);
				this.target = base.Tray.Var.targetMem;
			}else{
				this.switchQueue(this.from, this.to);
				base.Tray.Var.tray.removeChild(base.Tray.Var.targetMem);
				this.target.style.display = "block";
			}
			base.Tray.Var.targetMem = null;
			base.Tray.Var.actionIn = false;
			base.Tray.arrange();
		},
		checkFull: function(){
			var icons = base.Tray.Var.tray.getElementsByClassName("icon");
			if(icons.length<6){
				return false;
			}else{
				return true;
			}
		},
		//refresh all apps in the tray.
		arrange: function(){
			var icons = base.Tray.Var.tray.getElementsByClassName("icon");
			var num = icons.length;
			var spacing = (100-20*num)/(num+1);
			for(var i=0; i<num; i++){
				/*
				icons[i].style.webkitAnimation = "";
				*/				
				icons[i].style.webkitTransform = "";
				icons[i].style.top = "0";
				icons[i].style.height = "100%";
				icons[i].style.width = "20%";
				icons[i].style.left = (spacing+20)*i + spacing + "%";
			}
		},
		moveOutTray: function(){
			var target = this.target.cloneNode(true);
			this.container.appendChild(target);
			base.Tray.Var.targetMem = target;
		},
		//delete target from container and modify queue of the apps list.
		endToOut: function(isSuccess){
			if(typeof isSuccess == 'boolean' && isSuccess){
				var des = this.to-1;
				base.Tray.Var.tray.removeChild(this.target);
				this.target = base.Tray.Var.targetMem;
				this.queue[des] = this.target;
				this.target.style.left = (des%this.appsPerRow)*(100/this.appsPerRow)+"%";
				this.target.style.top = Math.floor(des/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
				this.target.style.height = 100/(this.pagesCount*this.appsPerColumn) + "%";
				this.target.style.width = "25%";				
			}
			base.Tray.Var.targetMem = null;
			base.Tray.arrange();
			base.Tray.Var.actionOut = false;
			base.Tray.restoreEvent.call(system);
		},
		isActionOut: function(target){
			try{
				if(target.parentNode.id == "tray"){
					base.Tray.Var.actionOut = true;
				}
				else{
					base.Tray.Var.actionOut = false;
				}
			}
			catch(error){
				debug.log(error);
			}
		},
		restoreEvent: function(){
			var key = this.target.id;
			var that = this;
			var widget = this.widgets[key];
			// if the target app has a widget, restore open/close event to the widget.
			if(widget){
				var openNode = document.getElementById(widget.open.node);
				var closeNode = document.getElementById(widget.close.node);
				
				// find the new location for widget according to its app's location.
				widget.widget.style.top = this.target.style.top;
				widget.widget.style.left = this.target.style.left;
				
				//restore the open event and close event to the app& widget.			
				openNode.addEventListener("dbclick", function(e){
					for(var j=0; j<that.queue.length; j++){
						if(that.queue[j] && that.queue[j].id === key){
							var elPos = j+1;
							// yield space for widget, pass the widget's size a the optional direction
						}
					}
					try{
						that.yield(elPos, that.widgets[key].size, "right");
						widget.open.func(e);
					}
					catch(error){
						console.log(error);
					}
				}, false);
				closeNode.addEventListener("dbclick", function(e){
					openNode.style.top = that.widgets[key].widget.style.top;
					openNode.style.left = that.widgets[key].widget.style.left;
					try{
						widget.close.func(e);
						// widthdraw the space where the widget disappears. arguemnts: widget size, and a optional direction
						setTimeout(function(){
							//that.withdraw(elPos, that.widgets[key].size, "left");						
							that.isWidgetShow = false;
							closeNode.style.display = "none";
						},800);
					}
					catch(error){
						console.log(error);
					}
				}, false);
			}
		}
	});	
}(_Base_);