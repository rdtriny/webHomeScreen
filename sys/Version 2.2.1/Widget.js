!function(base){	
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
				this.widgets[i] = wgt[i];
				try{
					if(typeof wgt[i].widget == "string"){
						this.widgets[i].widget = document.getElementById(wgt[i].widget);
					}else if(typeof wgt[i].widget == "object" && wgt[i].widget.nodeType == 1){
						this.widgets[i].widget = wgt[i].widget;
					}else{
						throw "wrong widget type, it should be DOM node or elemetn ID";
					}
				}
				catch (e){
					console.log(e);
				}
				this.initWidget(i, wgt[i]);
			}
		},
		
		/* 	add some listeners on the widget. 
			defines the methods of how to open/close widgets.
		*/
		initWidget: function(key,obj){
			var that = this;
			var elPos = -1;
			if(typeof obj.open.node == "string"){
				this.widgets[key].open.node = obj.open.node;
				var openNode = document.getElementById(obj.open.node);
			}else if(typeof obj.open.node == "object" && obj.open.node.nodeType == 1){
				this.widgets[key].open.node = obj.open.node.id;
				openNode = obj.open.node;
			}
			if(typeof obj.close.node == "string"){
				this.widgets[key].close.node = obj.close.node;
				var closeNode = document.getElementById(obj.close.node);
				
			}else if(typeof obj.close.node == "object" && obj.close.node.nodeType == 1){
				this.widgets[key].close.node = obj.close.node.id;
				var closeNode = obj.close.node;
			}
			//Hide the app icon, after open its widget
			openNode.addEventListener("dbclick", function(e){
				for(var j=0; j<that.queue.length; j++){
					if(that.queue[j] && that.queue[j].id === key){
						elPos = j+1;
						// yield space for widget, pass the widget's size a the optional direction
					}
				}
				try{
					that.yield(elPos, that.widgets[key].size, "right");
					obj.open.func(e);
				}
				catch(error){
					console.log(error);
				}
			},false);
			//show the app icon, when its widget has gone.
			closeNode.addEventListener("dbclick", function(e){
				openNode.style.top = that.widgets[key].widget.style.top;
				openNode.style.left = that.widgets[key].widget.style.left;
				try{
					obj.close.func(e);
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
		},
		//find the widget location, where it should be displayed.
		locateWidget: function(wgt, top, left){
			var widget = this.widgets[wgt].widget;
			widget.style.left = left;
			widget.style.top = top;
		},
	});
}(_Base_);