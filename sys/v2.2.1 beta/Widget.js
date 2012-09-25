!function(base){

	var Config  = base.Config,
		Page = base.Page,
		Drive = base.Drive,
		Tray = base.Tray,
		Box = base.Box;
		
	//some apps get widgets, so this is the way manage them.
	base.Widget = base.extend(base.Widget, {
		widgets: {},
		removeWidget: function(widget){
			var scripts = document.getElementsByTagName("script");
			for(var i=0; i<scripts.length; i++){
				if(scripts[i].src == widget){
					scripts[i].parentNode.removeChild(scripts[i]);
					return true;
				}
			}
			return false;
		},
		/* 
			remember the configuration of all the widgets.
			the wgt's structure is like:
			{
				"com.lge.camera/com.lge.camera.CamLoading" : {	
					widget:"flash", // widget DOM Node's id.
					open: {
						node: "com.lge.camera/com.lge.camera.CamLoading", // defines which node to open widget
						func: open // a function defined by user, defines the appearance when opening widgets.
					},
					close: {
						node: "flash", // defines which node to close widget
						func: disapear // a function defines the appearance when closing widgets.
					}},
					size: { // the widget's height and width, not pixels but the application block number.
						width: 2, 
						height 2
					}
			}
		*/
		registerWidget: function(wgt){
			for(var i in wgt){
				base.Widget.widgets[i] = wgt[i];
				try{
					if(typeof wgt[i].widget == "string"){
						base.Widget.widgets[i].widget = document.getElementById(wgt[i].widget);
					}else if(typeof wgt[i].widget == "object" && wgt[i].widget.nodeType == 1){
						base.Widget.widgets[i].widget = wgt[i].widget;
					}else{
						throw "wrong widget type, it should be DOM node or elemetn ID";
					}
				}
				catch (e){
					console.log(e);
				}
				base.Widget.initWidget(i, wgt[i]);
			}
		},
		
		/* 	add some listeners on the widget. 
			defines the methods of how to open/close widgets.
		*/
		initWidget: function(key,wgt){
			if(typeof wgt.open.node == "string"){
				base.Widget.widgets[key].open.node = wgt.open.node;
				var openNode = document.getElementById(wgt.open.node);
			}else if(typeof wgt.open.node == "object" && wgt.open.node.nodeType == 1){
				base.Widget.widgets[key].open.node = wgt.open.node.id;
				openNode = wgt.open.node;
			}
			if(typeof wgt.close.node == "string"){
				base.Widget.widgets[key].close.node = wgt.close.node;
				var closeNode = document.getElementById(wgt.close.node);
				
			}else if(typeof wgt.close.node == "object" && wgt.close.node.nodeType == 1){
				base.Widget.widgets[key].close.node = wgt.close.node.id;
				var closeNode = wgt.close.node;
			}
			base.Widget.attachEvent(key, openNode, closeNode, wgt);
		},
		//find the widget location, where it should be displayed.
		locateWidget: function(wgt, top, left){
			if(base.Widget.widgets[wgt]){
				var widget = base.Widget.widgets[wgt].widget;
				widget.style.left = left;
				widget.style.top = top;
			}
		},
		attachEvent: function(key, openNode,  closeNode, wgt ){
			var elPos = -1;
			//Hide the app icon, after open its widget
			openNode.lastChild.addEventListener("click", function(e){
				for(var j=0; j<base.Queue.queue.length; j++){
					if(base.Queue.queue[j] && base.Queue.queue[j].id === key){
						elPos = j+1;
						// yield space for widget, pass the widget's size a the optional direction
					}
				}
				try{
					base.App.Yield(elPos, base.Widget.widgets[key].size, "right");
					wgt.open.func(e);
					openNode.style.display = "none";
				}
				catch(error){
					console.log(error);
				}
			},false);
			//show the app icon, when its widget has gone.
			closeNode.addEventListener("dbclick", function(e){
				openNode.style.top = base.Widget.widgets[key].widget.style.top;
				openNode.style.left = base.Widget.widgets[key].widget.style.left;
				try{
					wgt.close.func(e);
					// widthdraw the space where the widget disappears. arguemnts: widget size, and a optional direction
					setTimeout(function(){
						//that.withdraw(elPos, that.widgets[key].size, "left");						
						base.Widget.isWidgetShow = false;
						closeNode.style.display = "none";
						openNode.style.display = "block";
					},800);
				}
				catch(error){
					console.log(error);
				}
			}, false);
		}
	});
	
	_Base_ = base;
}(_Base_);