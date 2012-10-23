/*
 * App Module manages the logic about application. 
 * 1. app creating
 * 2. app styling.
 * 3. app animations, like shake.
 * 4. Yield logic, affect to each other when widgets are opened.
 * 5. Drag logic, when dragging apps, apps may move, exchange, relocate and some other functions.
*/

!function(base){
		
	base.App = base.extend(base.App, {
		// a function which defines the structure of application's div.
		appStyle: null,
		target: null,
		// height,width of the application div.
		iconWidth: 0,
		iconHeight: 0,
		//find the app area's height and width
		getSize: function(){
			if(base.App.iconWidth&&base.App.iconHeight){
				return false;
			}
			var appScreen = document.getElementById("appScreen");
			if( appScreen.clientWidth && appScreen.clientHeight){
				base.App.iconWidth = appScreen.clientWidth/4;
				base.App.iconHeight = appScreen.clientHeight/4;
			}
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
				closeDiv.style.marginTop = "-4px";
				closeDiv.style.marginLeft = "-4px";
				closeDiv.style.zIndex = "2";
				closeDiv.style.background = "url(./images/close.png) top left no-repeat";
				closeDiv.style.backgroundSize = "100% 100%";				
				appNode.appendChild(closeDiv);
				
				var img = document.createElement("img");
				img.src = app.imgSrc;
				appNode.appendChild(img);
				
				var span = document.createElement("span");
				span.innerHTML = app.title;
				appNode.appendChild(span);
				
				var openDiv = document.createElement("div");
				openDiv.style.position = "absolute";
				openDiv.style.display = "none";
				openDiv.style.width = "20px";
				openDiv.style.height = "20px";
				openDiv.style.bottom = "0";
				openDiv.style.right = "0";				
				openDiv.style.marginTop = "4px";
				openDiv.style.marginLeft = "4px";
				openDiv.style.zIndex = "10";
				openDiv.style.background = "url(./images/enlarge.png) top left no-repeat";
				openDiv.style.backgroundPosition = "right bottom";				
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
		},
		resizeApp: function(app, pos){
			
			/*if(isTray){
				app.style.height = "100%";
				app.style.top = "0";
				app.style.left = (pos%base.Config.appsPerRow)*(100/base.Config.appsPerRow)+"%";
				return "tray";
			}
			*/
			if(app){
				app.style.left = (pos%base.Config.appsPerRow)*(100/base.Config.appsPerRow)+"%";
				app.style.top = Math.floor(pos/base.Config.appsPerColumn)*100/(base.Page.pagesCount*base.Config.appsPerColumn)+"%";
				app.style.height = 80/(base.Page.pagesCount*base.Config.appsPerColumn) + "%";
				return true;
			}
			return false;
		},
		shake: function(target){
			target.style.webkitTransformOrigin="50% 50%";
			target.style.webkitAnimationDuration= "150ms";
			target.style.webkitAnimationName= "shake";
			target.style.webkitAnimationIterationCount= "2";
			
			setTimeout(function(){
				target.style.webkitTransformOrigin="";
				target.style.webkitAnimationDuration= "";
				target.style.webkitAnimationName= "";
				target.style.webkitAnimationIterationCount= "";
			}, 5000);
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
				if(widgetSize.width == 2 && widgetSize.height == 2){
					//use the block** function , but switch the context to the global system.
					return base.App.Yield.block22(elPos, widgetSize, direction);
				}
				else if(widgetSize.width == 4 && widgetSize.height == 1){
					return base.App.Yield.block14(elPos, widgetSize, direction);
				}else if(widgetSize.width == 3 && widgetSize.height == 1){
					return base.App.Yield.block13(elPos, widgetSize, direction);
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
			var remainder = elPos % base.Config.appsPerRow, flag=false;
			// calculate where to display the widget
			
			// level 2: the element is in the 1st column or the 4th column or the other two columns.
			var str = "";
			str += base.App.Yield.checkAround(elPos+4);
				
			str += base.App.Yield.checkAround(elPos+5);
				
			str += base.App.Yield.checkAround(elPos+1);
				
			str += base.App.Yield.checkAround(elPos-3);
				
			str += base.App.Yield.checkAround(elPos-4);
				
			str += base.App.Yield.checkAround(elPos-5);
				
			str += base.App.Yield.checkAround(elPos-1);
				
			str += base.App.Yield.checkAround(elPos+3);
				
			//make a circle, from head to tail.
			str += str[0];
			
			// level 3: can yield to top blank spaces or not?
			if(str.substr(2,3) === "000"){
				if(remainder != 0){
					base.Queue.switchQueue(elPos, elPos-4);
					elPos -= 4;
					base.Debug.log("right top blank");					
					flag = true;
				}
			}
			else if(str.substr(4,3) === "000"){
				if(remainder != 1){
					base.Queue.switchQueue(elPos, elPos-5);
					elPos -= 5;
					base.Debug.log("left top blank");					
					flag = true;
				}
			}
			else{
				// level 4: compare left/right blank spaces under the element, stretch to more spaces area.
				// str.substr(*, *) + '0' avoids the match function returns null.					
				if(!(str.substr(6,3).match(/2/ig)) && !(str.substr(0,3).match(/2/ig))){
					if( (str.substr(0,3)+'0').match(/0/ig).length < (str.substr(6,3)+'0').match(/0/ig).length ){
						if(remainder == 1){
							base.Queue.switchQueue(elPos, elPos+1);
							elPos += 1;
						}						
						base.Debug.log("left down blank");
						base.Queue.switchQueue(elPos, elPos-1);
						elPos -= 1;
						base.App.Yield.down( elPos, widgetSize );
					}
					else{
						if(remainder == 0){
							base.Queue.switchQueue(elPos, elPos-1);
							elPos -= 1;
						}
						base.Debug.log("right down blank");
						base.App.Yield.down( elPos, widgetSize );
					}
					flag = true;
				}
				else if(!(str.substr(6,3).match(/2/ig)) && (str.substr(0,3).match(/2/ig))){
					if(remainder != 1){
						base.Queue.switchQueue(elPos, elPos-1);
						elPos -= 1;							
						base.Debug.log("left down blank");
						base.App.Yield.down( elPos, widgetSize );						
						flag = true;
					}
				}
				else if((str.substr(6,3).match(/2/ig)) && !(str.substr(0,3).match(/2/ig))){
					if(remainder != 0){
						base.Debug.log("right down blank");
						base.App.Yield.down( elPos, widgetSize );						
						flag = true;
					}
				}
			}
			
			var pages = Math.ceil(base.Queue.queue.length/(base.Config.appsPerRow*base.Config.appsPerColumn));
			if(pages > base.Page.pagesCount){
				base.Page.addPage(1);
			}
			return flag;
		},
		block14 : function(){
			
		},
		block13 : function(){
		
		},
		checkAround: function(pos){
			if(pos < 1)
				return '2';
			
			// widget
			if(base.Widget.isWidget(pos)){
				return '2';
			}
			// app
			else if(base.Queue.queue[pos-1]){
				return '1';
			}
			// blank
			else
				return '0';
		},
		/*
			push the applications which block widget's space downward.
			according to the widget's width, make a tiny loop each line
			according to the widget's height, calculate the vertical distance to move.
			from back to forth
		*/
		// a function of an object was called , the object was passed to the function as 'this', if the object can't be identified, window was passed just as the following function.
		down : function (elPos, widgetSize){
			var vSpace,spaceCount=0;
			var pos, widgetArray = {}, widgetPos;
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
						if(!base.Queue.queue[pos-1]){							
							spaceCount ++;
							
							for(var k=0; k<widgetSize.height; k++){
							
								for(var j=0; j<widgetSize.width; j++){
									widgetPos = pos-j-k*base.Config.appsPerRow;
									if(base.Queue.queue[widgetPos-1] && base.Widget.widgets[base.Queue.queue[widgetPos-1].id] && base.Widget.widgets[base.Queue.queue[widgetPos-1].id].widget.style.display == "block"){										
										widgetArray[base.Queue.queue[widgetPos-1].id] = widgetPos;
										break;
									}
								}
							}
						}
						pos += base.Config.appsPerRow;
					}
					spaceCount = 0;
					pos -= base.Config.appsPerRow;
					while(pos>elPos){
						if(base.Queue.queue[pos-1]){
							if(widgetArray[base.Queue.queue[pos-1].id]){
								widgetArray[base.Queue.queue[pos-1].id] += spaceCount*base.Config.appsPerRow;
							}							
							base.Queue.switchQueue(pos, pos+spaceCount*base.Config.appsPerRow);	
							//base.Debug.log("app",pos, pos+spaceCount * base.Config.appsPerRow);
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
						if(!base.Queue.queue[pos-1]){
							spaceCount ++;
							for(var k=0; k<widgetSize.height; k++){
								for(var j=0; j<widgetSize.width; j++){
									widgetPos = pos-j-k*base.Config.appsPerRow;
									if(base.Queue.queue[widgetPos-1] && base.Widget.widgets[base.Queue.queue[widgetPos-1].id] && base.Widget.widgets[base.Queue.queue[widgetPos-1].id].widget.style.display == "block"){										
										widgetArray[base.Queue.queue[widgetPos-1].id] = widgetPos;
										break;
									}
								}
							}
						}
						pos += base.Config.appsPerRow;
					}
					spaceCount = 0;
					pos -= base.Config.appsPerRow;
					while(pos>elPos){
						if(base.Queue.queue[pos-1]){
							if(widgetArray[base.Queue.queue[pos-1].id]){
								widgetArray[base.Queue.queue[pos-1].id] += spaceCount*base.Config.appsPerRow;
							}							
							base.Queue.switchQueue(pos, pos+spaceCount*base.Config.appsPerRow);
						}
						else{
							spaceCount ++;
						}
						pos -= base.Config.appsPerRow;	
					}
				}
				spaceCount = 0;
			}
			
			for(var i in widgetArray){
				if(typeof widgetArray[i] == "number" && widgetArray[i] != elPos){
					base.App.Yield.down( widgetArray[i], {width:2, height:2} );
				}
			}
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
				// only change style of the img node.
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
			// switch to edit mode.
			if(base.App.activeEdit){
				base.App.Drag.openEditMode();
				// make a weak vibration. vibrate after all the apps have changed their former style.
				setTimeout(function(){
					base.Browser.vibrate(60);
				},0);
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
					// when move app into the tray, and then move back to iconsContainer without fingers leaving, keep apps moving.
					if(base.Tray.Var.targetMem){
						base.Tray.Var.targetMem.style.left = (pagex-iconWidth/2) + "px";
						base.Tray.Var.targetMem.style.top  = (pagey-iconHeight/2) - iconHeight*base.Config.appsPerColumn+ "px";
					}
					
				}
			
				// decide if user wants to drag to next page or not.
				if(pagey>iconHeight*3.8 && pagey<iconHeight*4){
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
				else if(pagey>iconHeight*4){
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
				base.Tray.endToIn( base.Drive.Var.endY, base.Drive.Var.endX );
			}
			else if(base.Tray.Var.actionOut){
				if(!base.Queue.queue[base.App.to-1]){
					base.Tray.moveOutTray();
				}
				// if the destination space has no apps, move the app out of tray to iconsContainer. 
				// else restore the target's state.
				base.Tray.endToOut(base.App.to);
					
			}
			else{
				var from = base.App.from;
				if(typeof(base.App.to)=="number"){
					var des = base.App.to-1;
					// drag within one page or different pages with avaliable space.
					if(base.Page.rowIndexMem == base.Page.currentRowIndex || (!base.Queue.queue[des])){												
						base.App.Drag.doSwitch();
					}else{
						// drag to next page: if the desination gets an app,you are denied.						
						base.App.target.style.left = ((from-1)%base.Config.appsPerRow)*(100/base.Config.appsPerRow)+"%";
						base.App.target.style.top = Math.floor((from-1)/base.Config.appsPerColumn)*100/(base.Page.pagesCount*base.Config.appsPerColumn)+"%";
						
					}
					// restroe its default value.
					if(base.App.target.getAttribute('iWidget'))
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
					base.App.Drag.doSwitch();
				}
			}, 300);
		},
		doSwitch: function(){
			// the target is a widget
			if(base.App.target.getAttribute("iWidget")){
				if(base.Widget.moveWidget(base.App.from, base.App.to));
					base.App.from = base.App.to;
			}
			// the target is a app
			else{
				// the destination is a widget
				if(base.Widget.isWidget(base.App.to)){
					base.Queue.backToFrom(base.App.from);
				}
				// the destination is a app
				else{
					base.Queue.switchQueue(base.App.from, base.App.to);
					base.App.from = base.App.to;
				}
			}
		},
		bubbleDragEvent: function(e){
			var event = document.createEvent("Events");
			event.initEvent("drag", true, true);
			e.target.dispatchEvent(event);
		},
		openEditMode: function(){			
			var icons = base.Tray.tray.getElementsByClassName("icon");
			// style apps in iconsContainer to edit mode.
			for(var j=0; j<base.Queue.queue.length; j++){
				if(base.Queue.queue[j]){
					base.Queue.queue[j].firstChild.style.display = "block";
					if(base.Queue.queue[j].getAttribute("hasWidget")){
						base.Queue.queue[j].lastChild.style.display = "block";
					}
				}
			}
			// style widgets to edit mode
			for(var j in base.Widget.widgets){
				base.Widget.widgets[j].widget.lastChild.style.display = "block";
			}
			
			// restyle apps in faviourite tray to edit mode.
			for(var i=0; i<icons.length; i++){
				icons[i].firstChild.style.display = "block";
			}
			
			base.App.editMode = true;
		},
		closeEditMode: function(){
			var icons = base.Tray.tray.getElementsByClassName("icon");
			// restyle apps in iconsContainer.
			for(var j=0; j<base.Queue.queue.length; j++){
				if(base.Queue.queue[j]){
					base.Queue.queue[j].firstChild.style.display = "none";
					if(base.Queue.queue[j].getAttribute("hasWidget")){
						base.Queue.queue[j].lastChild.style.display = "none";
					}
				}
			}
			// restyle widgets to unlock edit mode.
			for(var j in base.Widget.widgets){
					base.Widget.widgets[j].widget.lastChild.style.display = "none";
			}
			
			// restyle apps in faviourite tray.
			for(var i=0; i<icons.length; i++){
				icons[i].firstChild.style.display = "none";
				icons[i].lastChild.style.display = "none";
			}
			base.App.editMode = false;
			base.App.activeEdit = false;
		}
	});
	
	_Base_ = base;
}(_Base_);