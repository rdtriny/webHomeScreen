!function(base){
		
	base.App = base.extend(base.App, {
		// a function which defines the structure of application's div.
		appStyle: null,
		// height,width of the application div.
		iconWidth: 0,
		iconHeight: 0,
		//find the app area's height and width
		getSize: function(){
			if(base.App.iconWidth&&base.App.iconHeight){
				return false;
			}
			var icons = base.container.getElementsByClassName("icon");
			var i = 0;
			while((!icons[i].clientWidth) && (!icons[i].clientHeight)){
				i++;
			}
			base.App.iconWidth = icons[i].clientWidth;
			base.App.iconHeight = icons[i].clientHeight;
			return true;
		},
		//register application to the system.
		register: function(app){
			base.App.appsCount ++;
			var appNode = base.App.createAppNode(app);
			if(app.widget){
				base.require(app.widget);
				appNode.setAttribute("hasWidget", "true");
			}
			base.Queue.queue.push(appNode);
		},
		createAppNode: function(app){
			var appNode;
			if(base.App.appStyle && typeof base.App.appStyle == "function"){
				appNode = base.App.appStyle();
			}else{
				appNode = document.createElement("div");
				appNode.className = "icon";
				appNode.id = app.packageName;				
				
				var closeDiv = document.createElement("div");
				closeDiv.style.position = "absolute";
				closeDiv.style.display = "none";
				closeDiv.style.width = "10px";
				closeDiv.style.height = "10px";
				closeDiv.style.top = "45%";
				closeDiv.style.left = "50%";
				closeDiv.style.marginTop = "-24px";
				closeDiv.style.marginLeft = "-24px";
				closeDiv.style.zIndex = "2";
				closeDiv.style.background = "url(./images/close.png) top left no-repeat";
				closeDiv.style.backgroundSize = "100% 100%";				
				appNode.appendChild(closeDiv);
				
				var openDiv = document.createElement("div");
				openDiv.style.position = "absolute";
				openDiv.style.display = "none";
				openDiv.style.width = "10px";
				openDiv.style.height = "10px";
				openDiv.style.top = "90%";
				openDiv.style.left = "90%";
				openDiv.style.zIndex = "2";
				openDiv.style.background = "url(./images/enlarge.png) top left no-repeat";
				openDiv.style.backgroundSize = "100% 100%";				
				appNode.appendChild(openDiv);
				
				var img = document.createElement("img");
				img.src = app.imgSrc;
				appNode.appendChild(img);
				
				var span = document.createElement("span");
				span.innerHTML = app.title;
				appNode.appendChild(span);
				
				var openDiv = document.createElement("div");
				openDiv.style.position = "absolute";
				openDiv.style.display = "none";
				openDiv.style.width = "8px";
				openDiv.style.height = "8px";
				openDiv.style.top = "45%";
				openDiv.style.left = "50%";				
				openDiv.style.marginTop = "20px";
				openDiv.style.marginLeft = "20px";
				openDiv.style.zIndex = "10";
				openDiv.style.background = "url(./images/enlarge.png) top left no-repeat";
				openDiv.style.backgroundSize = "100% 100%";				
				appNode.appendChild(openDiv);
			}
			return appNode;
		},
		//update the appearence of the app, change appStyle(a function)
		updateAppStyle: function(func){
			if(func && typeof func =="function"){
				base.App.appStyle = func;
				return true;
			}else{
				return false;
			}
		}
	});
	
	base.App = base.extend(base.App,{		
		appsCount: 0,
		/* 
			leave space for a widget to open.
			the data structure of widgetSize:
			size : {
				width: 2, // equals to 2 application blocks in width
				height: 2 // equals to 2 application blocks in height
				}
			direction // which direction the widget are stretching to.
		*/
		Yield : function(elPos, widgetSize, direction){
			if(widgetSize && elPos>0){
				if(widgetSize.width == 2 && widgetSize.width == 2){
					//use the block** function , but switch the context to the global system.
					base.App.Yield.block22(elPos, widgetSize, direction);
				}
				else if(widgetSize.width == 4 && widgetSize.height == 1){
					base.App.Yield.block14(elPos, widgetSize, direction);
				}else if(widgetSize.width == 3 && widgetSize.height == 1){
					base.App.Yield.block13(elPos, widgetSize, direction);
				}
			}
		}
	});
	
	base.App.Yield = base.extend(base.App.Yield, {
		/*
			yield has a prototype also, yield dispatch the work to its corresponding child according to the widget size.
			This is a usage of command design pattern.
			the entire structure:
			base.prototype.yield:
				base.prototype.yield.block22 // means block 2*2 widget's yield method.
				base.prototype.yield.block14 // means block 1*4 widget's yield method.
				and so on.
		*/
		block22 : function(elPos, widgetSize, direction){
			var icons = base.Queue.queue;	
			var remainder = elPos % base.Config.appsPerRow;
			// calculate where to display the widget
			// level 1: the element is in the first row or not
			if(elPos > 4){
				// level 2: the element is in the 1st column or the 4th column or the other two columns.
				var str = "";
				if(icons[elPos+3])
					str += '1';
				else 
					str += '0';
				if(icons[elPos+4])
					str += '1';
				else 
					str += '0';
				if(icons[elPos])
					str += '1';
				else
					str += '0';
				if(icons[elPos-4])
					str += '1';
				else
					str += '0';
				if(icons[elPos-5])
					str += '1';
				else 
					str += '0';
				if(icons[elPos-6])
					str += '1';
				else
					str += '0';
				if(icons[elPos-2])
					str += '1';
				else
					str += '0';
				if(icons[elPos+2])
					str += '1';
				else
					str += '0';
				//make a circle, from head to tail.
				str += str[0];
				
				// level 3: can yield to top blank spaces or not?
				if(str.substr(2,3) === "000"){
					if(remainder == 0){
						base.Queue.moveQueue(elPos, elPos-4);
						base.Debug.log("right top blank");
					}
				}
				else if(str.substr(4,3) === "000"){
					if(remainder == 1){
						base.Queue.moveQueue(elPos, elPos-5);
						base.Debug.log("left top blank");
					}
				}
				else{
					// level 4: compare left/right blank spaces under the element, stretch to more spaces area.
					// str.substr(*, *) + '0' avoids the match function returns null.
					if((str.substr(0,3)+'0').match(/0/ig).length < (str.substr(6,3)+'0').match(/0/ig).length){
						if(remainder != 1){
							base.Queue.moveQueue(elPos, elPos-1);
							base.Debug.log("right down blank");
							icons = base.App.Yield.down( icons, elPos, widgetSize ) || icons;
						}
					}
					else{
						if(remainder!=0){
							base.Debug.log("left down blank");
							icons = base.App.Yield.down( icons, elPos, widgetSize ) || icons;
						}
					}
				}
			}
			else{
				icons = base.App.Yield.down( icons, elPos, widgetSize ) || icons;
			}
			// log the new queue of apps.
			base.Queue.queue = icons;
		},	
		/*
			push the applications which block widget's space downward.
			according to the widget's width, make a tiny loop each line
			according to the widget's height, calculate the vertical distance to move.
			from back to forth
		*/
		// a function of an object was called , the object was passed to the function as 'this', if the object can't be identified, window was passed just as the following function.
		down : function (icons, elPos, widgetSize){
			if(!icons){
				return false;
			}
			var vSpace,spaceCount=0;
			var pos;
			// if the app is in the 4th column, then stretch to right.
			if(elPos % base.Config.appsPerRow == 0){			
				base.Queue.switchQueue(elPos, elPos-1);
				elPos -= 1;
			}
			for(var i=0; i<widgetSize.width; i++){
				// the state when i equals to 0
				if(!i){
					vSpace = widgetSize.height - 1;
					pos = elPos + base.Config.appsPerRow;
					while(spaceCount<vSpace){
						if(!icons[pos-1]){
							spaceCount ++;
						}
						pos += base.Config.appsPerRow;
					}
					spaceCount = 0;
					pos -= base.Config.appsPerRow;
					while(pos>elPos){
						if(icons[pos-1]){
							base.Queue.moveQueue(pos, pos+spaceCount * base.Config.appsPerRow);
						}
						else{
							spaceCount ++;
						}
						pos -= base.Config.appsPerRow;
					}
				}
				else{
					pos = elPos + i;
					vSpace = widgetSize.height;
					while(spaceCount<vSpace){
						if(!icons[pos-1]){
							spaceCount ++;
						}
						pos += base.Config.appsPerRow;
					}
					spaceCount = 0;
					pos -= base.Config.appsPerRow;
					while(pos>elPos){
						if(icons[pos-1]){
							base.Queue.moveQueue(pos, pos+spaceCount*base.Config.appsPerRow);
						}
						else{
							spaceCount ++;
						}
						pos -= base.Config.appsPerRow;	
					}
				}
				spaceCount = 0;
			}
			return icons;
		},
		block14 : function(){
			
		},
		block13 : function(){
		
		}	
	});
	
	// action definition when drag event fires.
	base.App.Drag = base.extend(base.App.Drag, {
		// the nth number when drag start.
		from: false,
		// the nth number when drag move.
		to: false,			
		editMode: false,
		activeEdit: false,
		dragStart: function(e){
			var target = e.target;
			base.Page.rowIndexMem = base.Page.currentRowIndex;
			
			// find the node of application or widget
			while(target.parentNode){
				if(target.parentNode.id=="iconsContainer" || target.className == "icon"){					
					break;
				}else{
					target = target.parentNode;
				}
			}
			if(/[A-z0-9]+\./ig.test(target.id)){
				/* jump up/down when active the app.
				target.style.webkitTransformOrigin="50% 50%";
				target.style.webkitAnimationDuration= ".5s";
				target.style.webkitAnimationName= "shake";
				target.style.webkitAnimationTimingFunction="ease";
				target.style.webkitAnimationIterationCount= "infinite";
				*/
				target.style.webkitTransform = "scale(1.2)";
				target.style.zIndex = "9";
				if(!base.App.editMode){
					base.App.activeEdit = true;
				}
				else{
					base.App.activeEdit = false;					
				}
				base.App.target = target;	
			}
			else if(target.nodeType == 1 && target.getAttribute('iWidget')){
				if(!base.App.editMode){
					base.App.activeEdit = true;
				}
				else{
					base.App.activeEdit = false;
				}
				base.App.target = target;
			}else{
				base.App.target = null;
			}
			if(base.App.activeEdit){
				base.App.Drag.openEditMode();
			}
			
			if(base.App.target){			
				
				// fires an drag event.
				base.App.Drag.bubbleDragEvent(e);	
				base.App.from = base.App.Drag.findStartPos();
				
				// if the app moves out of favorite tray, or moves into the favorite , or just in iconContainer.
				base.Tray.isActionOut(target);
			}
			
		},
		dragMove: function(e){
			if(!base.App.editMode || !base.App.target){
				return ;
			}
			var pagex = base.Drive.Var.endX = e.touches[0].pageX;
			var pagey = base.Drive.Var.endY = e.touches[0].pageY;			
			var iconHeight = base.App.iconHeight;
			var iconWidth = base.App.iconWidth;			
			/*
				calculate the row and column of position where you moved to.
				the following two 0.4 are used to correct the app's top-left corner to the center.
			*/
			var row = Math.round(pagey/iconHeight+0.4); //25% height
			var column = Math.round(pagex/iconWidth+0.4); //25% width
			if(base.Config.isVertical){
				// differnet coordinate system, iconContainer and tray. so use two method.
				if(base.Tray.Var.actionOut){
					base.App.target.style.left = (pagex-iconWidth/2) + "px";
					base.App.target.style.top  = (pagey-iconHeight/2) - iconHeight*base.Config.appsPerColumn+ "px";
				}else{
					base.App.target.style.left = (pagex-iconWidth/2)+ "px";
					base.App.target.style.top  = (pagey-iconHeight/2)+base.Page.currentRowIndex*iconHeight + "px";
					if(base.Tray.Var.targetMem){
						base.Tray.Var.targetMem.style.left = (pagex-iconWidth/2) + "px";
						base.Tray.Var.targetMem.style.top  = (pagey-iconHeight/2) - iconHeight*base.Config.appsPerColumn+ "px";
					}
				}
			}						
			if(base.Config.isVertical){
				// decide if user wants to drag to next page or not.
				if(pagey>iconHeight*3.5 && pagey<iconHeight*4){
					clearTimeout(base.App.timeout);
					base.App.timeout = setTimeout(function(){
						if(base.Page.currentRowIndex+1 < base.Page.pagesCount*base.Config.appsPerColumn){
							base.Page.slideToPage(1, 100);
						}
					}, 1000);
				}else if(pagey<iconHeight*0.2){
					clearTimeout(base.App.timeout);
					base.App.timeout = setTimeout(function(){
						if(base.Page.currentRowIndex > 0){
							base.Page.slideToPage(-1, 100);
						}
					}, 1000);
				}
				else if(pagey>=iconHeight*4){
					clearTimeout(base.App.timeout);
					// !that.actionIn : only move the app into the tray once. deny the other request.
					// !that.actionOut: the target app node is not in the tray
					if((!base.Tray.Var.actionOut) && (!base.Tray.Var.actionIn)){
						base.Tray.moveInTray();
					}
				}
				else{
					clearTimeout(base.App.timeout);
					row = row||1;
					if(row>4){
						base.App.to = false;
					}else{
						row += base.Page.currentRowIndex;
						base.App.to = (row-1)*4+column;
					}
				}
			}			
			
			// a green box indicates ok, a red box indicates you can't put application there.
			if(typeof base.App.to == "number"){
				base.Box.highlight(iconWidth);			
				base.App.Drag.exchangeOnMove(pagey);
			}else{				
				base.Box.highlight(false);	
			}
		},
		dragEnd: function(e){
				
			clearTimeout(base.App.timeout);
			clearTimeout(base.App.timeout2);
			if(!base.App.editMode || !base.App.target){
				return ;
			}else {
				/*
				this.target.style.webkitAnimationName = "";
				this.target.style.webkitAnimationIterationCount = "";		
				*/
				base.App.target.style.webkitTransform = "";
				base.Box.highlight(false);
			}			
			if(base.Tray.Var.actionIn){
				base.Tray.endToIn( base.Drive.Var.endY );
			}
			else if(base.Tray.Var.actionOut){
				if(!base.Queue.queue[base.App.to-1]){
					base.Tray.moveOutTray();
				}
				base.Tray.endToOut(!base.Queue.queue[base.App.to-1]);
			}
			else{
				var from = base.App.from;
				if(typeof(base.App.to)=="number"){
					var des = base.App.to-1;
					// drag within one page.
					if(base.Page.rowIndexMem == base.Page.currentRowIndex){
						base.Queue.switchQueue(from, base.App.to);
					}else{
						// drag to next page: if the desination gets an app,you are denied, else ok.
						if(base.Queue.queue[des]){
							base.App.target.style.left = ((from-1)%base.Config.appsPerRow)*(100/base.Config.appsPerRow)+"%";
							base.App.target.style.top = Math.floor((from-1)/base.Config.appsPerColumn)*100/(base.Page.pagesCount*base.Config.appsPerColumn)+"%";
						}else{
							base.Queue.moveQueue(from, base.App.to);
						}
					}
					// restroe its default value.
					base.App.target.style.zIndex = "";					
				}else{					
					base.App.target.style.left = ((from-1)%base.Config.appsPerRow)*(100/base.Config.appsPerRow)+"%";
					base.App.target.style.top = Math.floor((from-1)/base.Config.appsPerColumn)*100/(base.Page.pagesCount*base.Config.appsPerColumn)+"%";
				}
			}
			
			/*	editMode only can't be canceled by cancel key.
			 */
			//base.App.Drag.closeEditMode();
			base.App.to = false;
			base.App.from = false;
			base.App.toMem = false;
		},
		findStartPos: function(){
			for(var j=0; j<base.Queue.queue.length; j++){
				if(base.Queue.queue[j] && (base.Queue.queue[j].id === base.App.target.id || base.Queue.queue[j].id === base.App.target.getAttribute("iWidget"))){
					return (j+1);
				}
			}
		},
		exchangeOnMove: function(pagey){
			clearTimeout(base.App.timeout2);
			base.App.timeout2 = setTimeout(function(){
				if(!base.Tray.Var.actionOut && base.Page.rowIndexMem == base.Page.currentRowIndex && pagey < base.App.iconHeight*4){
					base.Queue.switchQueue(base.App.from, base.App.to);
					base.App.from = base.App.to;
				}
			}, 300);
		},
		bubbleDragEvent: function(e){
			var event = document.createEvent("Events");
			event.initEvent("drag", true, true);
			e.target.dispatchEvent(event);
		},
		openEditMode: function(){
			for(var j=0; j<base.Queue.queue.length; j++){
				if(base.Queue.queue[j]){
					base.Queue.queue[j].firstChild.style.display = "block";
					if(base.Queue.queue[j].getAttribute("hasWidget")){
						base.Queue.queue[j].lastChild.style.display = "block";
					}
				}
			}
			base.App.editMode = true;
		},
		closeEditMode: function(){
			for(var j=0; j<base.Queue.queue.length; j++){
				if(base.Queue.queue[j]){
					base.Queue.queue[j].firstChild.style.display = "none";
					if(base.Queue.queue[j].getAttribute("hasWidget")){
						base.Queue.queue[j].lastChild.style.display = "none";
					}
				}
			}
			base.App.editMode = false;
			base.App.activeEdit = false;
		}
	});
	
	_Base_ = base;
}(_Base_);