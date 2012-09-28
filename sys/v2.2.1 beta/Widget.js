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
		moveWidget: function(from, to){
			if(to%base.Config.appsPerRow == 0 || from == to){
				base.Queue.switchQueue(from, from);
				return false;
			}
			var f = [];
			var t = [];
			var inc;
			var pos;
			for(var i=0; i<2; i++){
				for(var j=0; j<2; j++){
					inc = i*4+j;
					f.push(from+inc);
					t.push(to+inc);
					if(base.Widget.isWidget(to+inc)){
						base.Queue.backToFrom(from);
						return false;
					}
				}
			}
			for(var i=0; i<f.length; i++){
				for( var j=0; j<t.length; j++){
					if(f[i] == t[j]){
						t[j] = undefined;
						f[i] = undefined;
					}
				}
			}
			for(var i=0; i<f.length; i++){				
				for( var j=0; j<t.length; j++){
					if(f[i]&&t[j]){
						base.Queue.switchQueue(f[i], t[j]);
						if(i == 0){
							pos = t[j];
						}
						f[i] = undefined;
						t[j] = undefined;
					}
				}
			}
			pos = pos || from;
			base.Debug.log("from", from, "to", to, "pos", pos);
			base.Queue.switchQueue(pos, to);
			return true;
		},
		isWidget: function(pos){
			var widgetPos;
			for(var k=0; k<2; k++){
				for(var j=0; j<2; j++){
					widgetPos = pos-j-k*base.Config.appsPerRow;
					/*	
						Destination space is occupied, and it gets a widget and the widget is now displaying
						so, the destination is a widget.
					*/
					if(base.Queue.queue[widgetPos-1] && base.Widget.widgets[base.Queue.queue[widgetPos-1].id] && base.Widget.widgets[base.Queue.queue[widgetPos-1].id].widget.style.display == "block"){										
						//  we are not checking the same one,
						if(base.Queue.queue[widgetPos-1].id != base.App.target.getAttribute("iWidget"))
							return true;
					}
				}
			}
			return false;
		},
		attachEvent: function(key, openNode,  closeNode, wgt ){
			var elPos = -1;
			//Hide the app icon, after open its widget
			openNode.lastChild.addEventListener("click", function(e){
				for(var j=0; j<base.Queue.queue.length; j++){
					if(base.Queue.queue[j] && base.Queue.queue[j].id === key){
						elPos = j+1;
						break;
						// yield space for widget, pass the widget's size a the optional direction
					}
				}				
				base.Widget.widgets[key].widget.style.top = openNode.style.top;
				base.Widget.widgets[key].widget.style.left = openNode.style.left;
				// the following integer: double app's height plus one line spacing.
				base.Widget.widgets[key].widget.style.height = 45/_Base_.Page.pagesCount + "%";
				
				try{
					base.App.Yield(elPos, base.Widget.widgets[key].size, "right");
					base.Debug.log("Widget.js elPos", elPos);
					wgt.open.func(e);
					openNode.style.display = "none";
					closeNode.style.display = "block";
				}
				catch(error){
					console.log(error);
				}
			},false);
			//show the app icon, when its widget has gone.
			closeNode.lastChild.addEventListener("click", function(e){
				openNode.style.top = base.Widget.widgets[key].widget.style.top;
				openNode.style.left = base.Widget.widgets[key].widget.style.left;
				
				try{
					wgt.close.func(e);
					// widthdraw the space where the widget disappears. arguemnts: widget size, and a optional direction
					//that.withdraw(elPos, that.widgets[key].size, "left");	
					closeNode.style.display = "none";
					openNode.style.display = "block";
				}
				catch(error){
					console.log(error);
				}
			}, false);
		},
		refresh: function(){
			for( var i in base.Widget.widgets){
				base.Widget.widgets[i].widget.style.height = 45/_Base_.Page.pagesCount + "%";
				base.Widget.widgets[i].widget.style.top = base.Helper.toNum(base.Widget.widgets[i].widget.style.top)*(base.Page.pagesCount-1)/base.Page.pagesCount + "%";
			}
		}
	});
	
	_Base_ = base;
}(_Base_);