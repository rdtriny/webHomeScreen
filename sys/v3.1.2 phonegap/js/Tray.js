!function(base){
		
	var Drive = base.Drive,
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
		trayApps: [],
		Var: {
			targetMem: null,
			actionIn: false,
			actionOut: false
		},
		addFixedArea: function(){
			var div = document.createElement("div");
			div.style.width = "100%";
			div.style.height = "16%";
			div.style.zIndex = "31";
			div.style.position = "absolute";
			div.style.bottom = "0";
			div.style.left = "0";
			div.style.borderTop = "1px solid #F0FFF0";
			div.id = "tray";
			base.Tray.tray = div;
			document.body.appendChild(div);		
		},
		moveInTray: function(){
			var target, id = base.App.target.getAttribute("iWidget");
			if(id){
				target = document.getElementById(id).cloneNode(true);
				target.style.display = "block";
			}
			else{
				target = base.App.target.cloneNode(true);
			}
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
		endToIn: function(pagey, pagex){
			var id = base.App.target.getAttribute("iWidget");
			if(pagey>=base.App.iconHeight*4 && (!base.Tray.checkFull())){
				base.Queue.delQueue(base.App.from);
				
				// if target is widget, and move into tray successfully, remove the related app, not the widget, 
				// else target is app, remove it directly.
				if(!id){
					base.container.removeChild(base.App.target);
				}else{
					base.container.removeChild(document.getElementById(id));
				}
				
				base.App.target = base.Tray.Var.targetMem;
				// hide the widget open icon
				base.App.target.lastChild.style.display = "none";				var pos = Math.floor(pagex/base.App.iconWidth);
				base.Tray.yield(pos);
				base.Tray.trayApps[pos] = base.App.target;
				// hide the app name and the close image  when move the app into the tray. 
				base.App.target.getElementsByTagName("span")[0].style.display = "none";
				base.App.target.firstChild.style.display = "none";
				
				base.Tray.arrange();
			}else{
				base.Queue.switchQueue(base.App.from, base.App.to);
				base.Tray.tray.removeChild(base.Tray.Var.targetMem);
				base.App.target.style.display = "block";
			}
			base.Tray.Var.targetMem = null;
			base.Tray.Var.actionIn = false;
		},
		checkFull: function(){
			var icons = base.Tray.tray.getElementsByClassName("icon");
			if(icons.length<5){
				return false;
			}else{
				return true;
			}
		},
		//refresh all apps in the tray.
		arrange: function(pagex){			
			for( var i=0; i<base.Tray.trayApps.length; i++ ){
				var app = base.Tray.trayApps[i];
				if( app ){
					app.style.webkitTransform = "";
					app.style.top = "0";
					app.style.height = "100%";
					app.style.left = 25*i + "%";
					app.style.backgroundSize = "0 0";
					console.log(app.style.background);
				}
			}
		},
		moveOutTray: function(){
			var target = base.App.target.cloneNode(true);
			base.container.appendChild(target);
			base.Tray.Var.targetMem = target;
		},
		//delete target from container and modify queue of the apps list.
		endToOut: function(to){
			// to iconsContainer
			if( base.Drive.Var.endY < base.App.iconHeight*4){
				if( typeof to == "number" && (!base.Queue.queue[base.App.to-1]) ){
					var des = base.App.to-1;
					base.Tray.tray.removeChild(base.App.target);
					base.App.target = base.Tray.Var.targetMem;
					base.Queue.queue[des] = base.App.target;
					base.App.resizeApp(base.App.target, des);
					// if the app gets a widget, show open widget icon.
					if(base.App.target.getAttribute("hasWidget"))
						base.App.target.lastChild.style.display = "block";
					
					// display the close image and the appname
					base.App.target.getElementsByTagName("span")[0].style.display = "block";
					base.App.target.firstChild.style.display = "block";
					base.App.target.style.backgroundSize = "100%";
					
					
					for( var i=0; i<4; i++ ){
						if( base.Tray.trayApps[i] && base.Tray.trayApps[i].id == base.App.target.id ){
							base.Tray.trayApps[i] = undefined;
						}
					}
				}
				else{
					// if move out of the tray failed, remove targetMem;
					if( base.Tray.Var.targetMem )
						base.container.removeChild(base.Tray.Var.targetMem);
				}
			}
			// to tray
			else{
				var to = Math.floor(base.Drive.Var.endX/base.App.iconWidth);
				for( var i=0; i<4; i++){
					if(base.Tray.trayApps[i] && base.Tray.trayApps[i].id == base.App.target.id){
						var from = i;
					}
				}
				if( typeof to == "number" && typeof from == "number"){
					base.Tray.switchPos(from, to);
				}
				// if move out of the tray failed, remove targetMem;
				if( base.Tray.Var.targetMem )
					base.container.removeChild(base.Tray.Var.targetMem);
			}
			base.Tray.arrange();
			base.Tray.Var.targetMem = null;
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
			var widget = base.Widget.widgets[key];
			
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
		},
		yield: function(toPos){
			if(!base.Tray.trayApps[toPos]){
				return true;
			}
			var blank = -1;
			for(var i=toPos; i>=0; i--){
				if(!base.Tray.trayApps[i]){
					blank = i;
				}
			}
			if(blank != -1){
				for( i=blank+1; i<=toPos; i++ ){
					base.Tray.switchPos(i, i-1);
				}
			}
			else{
				for(i=toPos+1; i<4; i++){
					if(!base.Tray.trayApps[i]){
						blank = i;
					}
				}
				if(blank != -1){
					for( i=blank; i>toPos; i-- ){
						base.Tray.switchPos(i, i-1);
					}
				}
				else{
					return false;
				}
			}
			return true;
		},
		switchPos: function(from, to){
			if(from == to)
				return false;
			var tmp = base.Tray.trayApps[from];
			base.Tray.trayApps[from] = base.Tray.trayApps[to];
			base.Tray.trayApps[to] = tmp;
			return true;
		}
	});	
	
	_Base_ = base;
}(_Base_);