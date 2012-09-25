!function(base){
		
	var Drive = base.Drive,
		Widget = base.Widget,
		Box = base.Box;
	
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
		
		tray: null,
		Var: {
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
			base.Tray.tray = div;
			document.body.appendChild(div);		
		},
		moveInTray: function(){
			var target = base.App.target.cloneNode(true);
			target.style.top = "0";
			target.style.height = "100%";
			target.style.width = "20%";
			base.Tray.tray.appendChild(target);
			base.App.target.style.display = "none";
			base.Tray.Var.actionIn = true;			
			base.Tray.Var.targetMem = target;
			if(base.Tray.checkFull()){
				base.App.to = base.App.from;
			}
		},
		endToIn: function(pagey){
			if(pagey>=base.App.iconHeight*4 && (!base.Tray.checkFull())){
				base.Queue.delQueue(base.App.from);
				base.container.removeChild(base.App.target);
				base.App.target = base.Tray.Var.targetMem;
			}else{
				base.Queue.switchQueue(base.App.from, base.App.to);
				base.Tray.tray.removeChild(base.Tray.Var.targetMem);
				base.App.target.style.display = "block";
			}
			base.Tray.Var.targetMem = null;
			base.Tray.Var.actionIn = false;
			base.Tray.arrange();
		},
		checkFull: function(){
			var icons = base.Tray.tray.getElementsByClassName("icon");
			if(icons.length<6){
				return false;
			}else{
				return true;
			}
		},
		//refresh all apps in the tray.
		arrange: function(){
			var icons = base.Tray.tray.getElementsByClassName("icon");
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
			var target = base.App.target.cloneNode(true);
			base.container.appendChild(target);
			base.Tray.Var.targetMem = target;
		},
		//delete target from container and modify queue of the apps list.
		endToOut: function(isSuccess){
			if(typeof isSuccess == 'boolean' && isSuccess){
				var des = base.App.to-1;
				base.Tray.tray.removeChild(base.App.target);
				base.App.target = base.Tray.Var.targetMem;
				base.Queue.queue[des] = base.App.target;
				base.App.target.style.left = (des%base.Config.appsPerRow)*(100/base.Config.appsPerRow)+"%";
				base.App.target.style.top = Math.floor(des/base.Config.appsPerColumn)*100/(base.Page.pagesCount*base.Config.appsPerColumn)+"%";
				base.App.target.style.height = 100/(base.Page.pagesCount*base.Config.appsPerColumn) + "%";
				base.App.target.style.width = "25%";				
			}
			base.Tray.Var.targetMem = null;
			base.Tray.arrange();
			base.Tray.Var.actionOut = false;
			base.Tray.restoreEvent();
		},
		isActionOut: function(target){
			try{
				if(target.parentNode && target.parentNode.id == "tray"){
					base.Tray.Var.actionOut = true;
				}
				else{
					base.Tray.Var.actionOut = false;
				}
			}
			catch(error){
				base.Debug.log(error);
			}
		},
		restoreEvent: function(){
			var key = base.App.target.id;
			var widget = Widget.widgets[key];
			// if the target app has a widget, restore open/close event to the widget.
			if(widget){
				var openNode = document.getElementById(widget.open.node);
				var closeNode = document.getElementById(widget.close.node);
				
				// find the new location for widget according to its app's location.
				widget.widget.style.top = base.App.target.style.top;
				widget.widget.style.left = base.App.target.style.left;
				
				//restore the open event and close event to the app& widget.
				base.Widget.attachEvent(key, openNode, closeNode, widget);
			}
		}
	});	
	
	_Base_ = base;
}(_Base_);