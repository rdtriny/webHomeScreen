var _Base_ = (function(window, undefined){

	var base = function(container, config){
	
		// when the document is ready, begin to setup the system.
		
		window.addEventListener('load',function(){
			if(typeof container == "string"){
				this.container = document.getElementById(container);
			}
			else if(typeof container == "object" && container.nodeType == 1){
				this.container = container;
			}
			//copy the configs into the base's prototype.
			if(config && typeof config == "object"){
				for(var i in config){
					this[i] = config[i];
				}
			}
			document.body.addEventListener("touchstart", function(e){
				this.touchstart(e);
			}.bind(this), false);
			
			document.body.addEventListener("touchmove", function(e){
				this.touchmove(e);
			}.bind(this), false);
			
			document.body.addEventListener("touchend", function(e){
				this.touchend(e);
			}.bind(this), false);
			
			document.body.addEventListener("touchcancel", function(e){
				this.touchcancel(e);
			}.bind(this), false);
			
			document.body.addEventListener("click", function(e){
				this.click(e);
			}.bind(this), false);
			
			// It's a flag to direct the widgets' action.
			this.isWidgetShow = false;
			// add the favorite tray area.
			this.addFixedArea();
			// some sound effect.
			base.Sound.loadAudio("./mp3.mp3");
			// launch the system, init all components.
			this.run();
			base.Version.showVersion();
		}.bind(this), false);
	};	
		
	//
	//	a interface which to include properties from other objects.
	//	example:
	//		var target = {};
	//		base.extend(target,{a:1,b:2},{c:[1,2,3]});
	//	parameters:
	//		target, the target object which wants to extend more properties.
	//		(optinal)obj, the object to give target properties.
	//		 .....
	//		(optinal)objN, the nth object to give target properties.
	//
	base.extend = function(target){
		var target = arguments[0];
		if(typeof target != "object"){
			target = {};
		}
		for(var i = 1; i<arguments.length; i++){
			var options = arguments[i];
			if(typeof options == "object"){
				for( var name in options){
					target[name] = options[name];
				}
			}
		}
		return target;
	};
	
	//
	// Some special APIs, which is supported by browser native code. Not native interfaces.
	//
	// regListener #### 
	// 		used to add a callback function to native, when apps are ready, native code will call callback, and pass
	// 		the app list JSON.
	//
	// getDefaultIconUri ####  
	//		used to fetch a default image, before the real images are loaded, show default images.
	//
	//  launchApp ####
	//		launch an specific android activity
	//
	base.Browser = base.extend( base.Browser, {
		regListener : function(callbackName){
			window.nativeapps.setWebUpdateContentCallback(callbackName);
		},	
		getDefaultIconUri : function(){
			// If the icons aren't prepared, use a default icon.
			return window.nativeapps.getDefaultAppIconUri();
		},
		//identification is like this: com.orange.browser/com.a.b
		launchApp : function(identification){
			// identification stands for the id of appliction div, which is like : com.*.*/com.*.*.*Activity
			var array = identification.split('/');
			var pkg = array[0];
			var cls = array[1];
			// native interface, two arguments: package name and activity name.
			window.nativeapps.launchActivity(pkg, cls);
		}
	});
	
	// parse to float
	var toNum = function(arg){
		var result = parseFloat(arg);
		if(isNaN(result)){
			result = 0;
		}
		return result;
	}
	
	//
	// APIs related to DOM node
	//
	// removeAllChild : remove all children of a specified node.
	// parameters: 
	//		node ###  the Node whose's children will be removed.
	// example:
	// 		base.DOM.remove(document.body);
	//
	//
	
	base.DOM = base.extend(base.DOM, {			
		removeAllChild : function(node){
			if(typeof node == "object" && node.nodeType == 1){
				while(node.firstChild){
					node.removeChild(node.firstChild);
				}
			}
		}	
	});
	
	//
	// add a API debug, for logging info
	// debug is working for debug the program. Note: don't log large object in deepth like window/document, may exceed the stack size, and get error.
	//
	var debug = base.Debug = base.extend(base.Debug, {
		log : function(){
				try{
					var str = base.Debug.stringify.apply(base.Debug, arguments).slice(0, -1);
					console.log(str);
					return str;
				}
				catch(error){
					console.log(error);
				}
		},	
		stringify : function(){
			var str="";
			for(var i=0; i<arguments.length; i++){
				var type = toString.call(arguments[i]);
				if(type.indexOf('Object') != -1){
					str += '{';
					for(var j in arguments[i]){
						str += j+':'+base.Debug.stringify(arguments[i][j]);
					}
					if(str[str.length-1] != '{')
						str = str.substr(0, str.length-1);
					str += '},';
				}
				else if(type.indexOf('Array') != -1){
					str += '[';
					for(var n=0; n<arguments[i].length; n++){
						str +=  base.Debug.stringify(arguments[i][n]);
					}
					if(str[str.length-1] != '[')
						str = str.substr(0, str.length-1);
					str +='],';
				}
				else{
					str += arguments[i]+',';				
				}
			}
			return str;
		}
	});

	base.fn = base.prototype = {
		// a function which defines the structure of application's div.
		appStyle: null,
		// coordinate when you touch the screen.
		startX: 0,
		startY: 0,
		// length between two fingers.
		pinchStartLen: 0,
		pinchEndLen: 0,
		// the return value of setTimeout
		longTapIndex: -1,
		// flag indicates whether longtap fires or not
		longtapStart: false,
		lastClickTime: 0,
		// the return value of setTimeout
		clickIndex: -1,
		appsPerRow: 4,
		appsPerColumn: 4,
		appsCount: 0,
		pagesCount: 0,
		currentRowIndex: 0,
		// distance from touch start to touch end
		movedDistance: 0,
		// distance to the top border of iconContainer div.
		moveStartX: 0,
		moveStartY: 0,
		// the coordinate next to the last.
		nextToEndX: 0,
		nextToEndY: 0,
		// the last coordinate
		endX: 0,
		endY: 0,
		// a nodeElement, a sidebar
		sidebar: null,
		lastMoveTime: undefined,
		isVertical: false,
		isDragging: false,
		// can't move background in default.
		isBGMovable: false, 
		// the queue of all the application, it may change according to the dragging.
		queue: [],
		// height,width of the application div.
		iconWidth: 0,
		iconHeight: 0,
		// the nth number when drag start.
		from: false,
		// the nth number when drag move.
		to: false,
		run: function(){
			// this is the callback function when init. native code can only access the properties of window.
			window.loadRes = this.loadRes.bind(this);
			base.Browser.regListener("loadRes");
		},
		// parse the applications' JSON info and then register them.
		loadRes: function(appListJson, lastBatch){
			var apps, defaultUri = base.Browser.getDefaultIconUri();
			apps = eval(appListJson);
			var len = apps.length;
			var icon, label;
			for (var i = 0; i < apps.length; i++){
				var icon = defaultUri;
				if (apps[i].iconUri != null) {
					icon = apps[i].iconUri;
				}
				label = apps[i].label || "LOADING";
				if(i == 0)
					this.register({title:label,packageName:apps[i].appPackage+"/"+apps[i].appClass,imgSrc:icon,widget:"./widget/weather.js"});
				else
					this.register({title:label,packageName:apps[i].appPackage+"/"+apps[i].appClass,imgSrc:icon,widget:""});
			}
			this.init();
		},
		init: function(){
			var appNode = false;
			this.pagesCount = Math.ceil(this.appsCount/(this.appsPerRow*this.appsPerColumn));
			for(var i=0; i<this.appsCount; i++){
				appNode = this.queue[i];
				this.display(appNode);
			}
			// figure out coordinate of each application and the height of iconContainer div.
			this.styleApp();
		},
		//register application to the system.
		register: function(app){
			this.appsCount ++;
			var appNode = this.createAppNode(app);
			if(app.widget){
				this.require(app.widget);
				appNode.setAttribute("isWidget", "true");
			}
			this.queue.push(appNode);
		},
		//manage the pages which is hosting app icons. inc for increment
		styleApp: function(){
			var icons = this.container.getElementsByClassName("icon");
			if(this.isVertical){
				this.container.style.height = 100*this.pagesCount+"%";
				for(var i=0; i<icons.length; i++){
					icons[i].style.height = 100/(this.pagesCount*this.appsPerColumn)+"%";						
					icons[i].style.left = (i%this.appsPerRow)*(100/this.appsPerRow)+"%";
					icons[i].style.top = Math.floor(i/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
				}
			}
			else{
				this.container.style.width = 100*this.pagesCount+"%";
				for(var i=0; i<icons.length; i++){					
					icons[i].style.height = 100/(this.pagesCount*this.appsPerRow)+"%";						
					icons[i].style.left = (i%this.appsPerRow)*100/(this.pagesCount*this.appsPerRow)+"%";
					icons[i].style.top = Math.floor(i/this.appsPerColumn)*(100/this.appsPerColumn)+"%";
				}
			}
		},
		createAppNode: function(app){
			var appNode;
			if(this.appStyle && typeof this.appStyle == "function"){
				appNode = this.appStyle();
			}else{
				appNode = document.createElement("div");
				appNode.className = "icon";
				appNode.id = app.packageName;				
				appNode.setAttribute("elPos", this.appsCount);				
				
				var img = document.createElement("img");
				img.src = app.imgSrc;
				appNode.appendChild(img);
				
				var span = document.createElement("span");
				span.innerHTML = app.title;
				appNode.appendChild(span);				
			}
			return appNode;
		},	
		//display all the app icons to the screen.
		display: function(appNode){
			this.container.appendChild(appNode);
		},
		//update the appearence of the app, change appStyle(a function)
		updateAppStyle: function(func){
			if(func && typeof func =="function"){
				this.appStyle = func;
				return true;
			}else{
				return false;
			}
		}
	};
	
	// move background image.
	var moveBG = function(isMovable, coor){
		if(isMovable && typeof coor.y == 'number'){
			document.body.style.backgroundPosition = "0 " + (coor.y*100/document.getElementById("iconsContainer").clientHeight)+"%";
		}
	};
	
	//change sidebar's position.
	var moveSidebar = function(sidebar, coor){
		if(sidebar && typeof coor.y == "number"){
			var top = coor.y;
			var containerH = document.getElementById("iconsContainer").clientHeight;
			sidebar.style.top = 100*top/containerH + "%";
		}
	};
	
	base.extend(base.fn, {
		touchstart: function(e){
			// display the sidebar.
			this.sideBar(true);
			// calculate the app's height and width, once for all.
			this.calculate();
			this.pinchEndLen = 0;
			this.longtapStart = false;
			if(e.touches.length === 1){
				this.startX = e.touches[0].pageX;
				this.startY = e.touches[0].pageY;
				
				//if you touch one point for 1 seconds, longtap fires.
				this.longTapIndex = setTimeout(function(){
					var event = document.createEvent("Events");
					event.initEvent("longtap", true, true);
					e.target.dispatchEvent(event);
					this.longtapStart = true;
					this.dragStart(e);							
					this.sideBar(false);
				}.bind(this), 1000);
			}
			else if(e.touches.length === 2){
				//this line is very very important, 'cause when two point gestures fire, the length will be 1,2,1 in order. prevent Drag event.
				clearTimeout(this.longTapIndex);
				var lenX = e.touches[1].pageX-e.touches[0].pageX;
				var lenY = e.touches[1].pageY-e.touches[0].pageY;
				this.pinchStartLen = Math.sqrt(lenX*lenX+lenY*lenY);
			}
		},
		touchmove: function(e){
			e.preventDefault();
			this.lastMoveTime = new Date;					
			clearTimeout(this.longTapIndex);
			// if longtap fires just now, dragMove() will run. if not, slide will run.
			if(!this.longtapStart){
				if(e.touches.length == 1){
					this.nextToEndX = this.endX;
					this.nextToEndY = this.endY;
					var pagex = this.endX = e.touches[0].pageX;
					var pagey = this.endY = e.touches[0].pageY;					
					if(this.isVertical){
						var y = this.startY-pagey + this.moveStartY;
						var maxHeight = document.getElementById("appScreen").clientHeight*(this.pagesCount-1);
						if(y> maxHeight){
							y = maxHeight;
						}else if(y<0){
							y=0;
						}
						var des = {x:0, y:y};
						this.movedDistance = pagey-this.startY;
					}
					else{
						var x = pagex-this.startX + this.moveStartX;					
						var maxWidth = document.getElementById("appScreen").clientWidth*(this.pagesCount-1)*-1;
						if(x>0)
							x=0;
						else if(x < maxWidth)
							x=maxWidth;
						des = {x:x, y:0};
						this.movedDistance = pagex-this.startX;
					}
					moveSidebar(this.sidebar, des);
					moveBG(this.isBGMovable, des);
					this.css3move(this.container, des);
				}
				else if(e.touches.length == 2){
					if(!this.pinchEndLen){
						this.pinchEndLen = Math.sqrt((e.touches[1].pageX-e.touches[0].pageX)*(e.touches[1].pageX-e.touches[0].pageX)+(e.touches[1].pageY-e.touches[0].pageY)*(e.touches[1].pageY-e.touches[0].pageY));
						var pinchEvent = document.createEvent("Events");
						pinchEvent.initEvent("pinch", true, true);
						pinchEvent.scale = this.pinchEndLen/this.pinchStartLen;
						e.target.dispatchEvent(pinchEvent);
					}
				}
			}else{
				this.dragMove(e);
			}
		},
		touchend: function(e){			
			if(this.longtapStart){
				this.dragEnd(e);				
			}else{
				clearTimeout(this.longTapIndex);
				var w = this.endX-this.nextToEndX;
				var h = this.endY-this.nextToEndY;
				var time = (new Date - this.lastMoveTime);
				var lastMoveSpeed = Math.sqrt(w*w + h*h)/time;				
				// when your finger has moved on the screen, swipe event will bubble up.
				if(this.endX){
					if(Math.abs(this.endX-this.startX) > Math.abs(this.endY-this.startY)){
						if(this.endX > this.startX){
							var direction = "right";
						}else{
							direction = "left";
						}
					}else{
						if(this.endY > this.startY){
							var direction = "down";
						}else{
							direction = "up";
						}
					}					
					var swipe = document.createEvent("Events");
					swipe.initEvent("swipe", true, true);
					swipe.data = {};
					swipe.data.direction = direction;
					swipe.data.endSpeed = lastMoveSpeed;
					e.target.dispatchEvent(swipe);
					this.endX = 0;
				}
				
				if(this.isVertical){
					var percent = this.movedDistance / (this.iconHeight*this.appsPerColumn);				
					// max height to iconContainer's top border
					var max = (this.pagesCount-1)*this.appsPerColumn;
					// swipe in high speed, slide to next page.
					if(lastMoveSpeed>0.3){
						if(percent>0){
							this.currentRowIndex -= this.appsPerColumn;
							// make sure rowindex > 0
							this.currentRowIndex = this.currentRowIndex>0 ? this.currentRowIndex : 0;
						}
						else if(percent<0){
							this.currentRowIndex += this.appsPerColumn;
							// make sure rowindex < totalnum
							this.currentRowIndex = this.currentRowIndex < max ? this.currentRowIndex : max;
						}
					// low speed slide row to row.
					}else{
						var movedRow = Math.round(percent*this.appsPerColumn);
						// note that movedRow is negative when slide up, positive when slide down.
						this.currentRowIndex -= movedRow;
						// make sure rowindex > 0 && rowIndex < max
						if(this.currentRowIndex < 0)
							this.currentRowIndex  = 0;
						else if(this.currentRowIndex>max)
							this.currentRowIndex = max;					
						
					}
					var y = this.currentRowIndex*this.iconHeight;
					this.moveStartY = y;
					var des = {x:0, y:y};
				}
				moveSidebar(this.sidebar, des);
				this.css3move(this.container, des, 100);
				moveBG(this.isBGMovable, des);
				this.sideBar(false);
				this.movedDistance = 0;
			}			
		},
		// sometimes touchcancel when you move out of the screen.
		touchcancel: function(e){
			this.touchend(e);
		},
		click: function(e){
			var that = this;
			var now = new Date;			
			var target = e.target;
			// two clicks within 400ms, double click fires, or two click event fires.
			if(now - this.lastClickTime<400){
				clearTimeout(this.clickIndex);
				var event = document.createEvent("Events");
				event.initEvent("dbclick", true, true);
				e.target.dispatchEvent(event);
			}else{
				this.clickIndex = setTimeout(function(){
					while(!target.id && target.id!="iconsContainer"){
						target = target.parentNode;
					}				
					if(/[A-z0-9]+\./ig.test(target.id) && e.target.nodeName == "IMG"){						
						base.Browser.launchApp(target.id);
						console.log(target.id);
						base.Sound.playAudio(0);
					}
				}, 400);
			}
			this.lastClickTime = now;
		},				
		//switch the pages up/down.
		slideToPage: function(inc, time){
			var rows = inc*this.appsPerColumn;			
			this.currentRowIndex += rows;
			// the total num of rows
			var max = (this.pagesCount-1)*this.appsPerColumn;
			// make sure rowindex < totalnum and rowindex >0
			if(this.currentRowIndex < 0)
				this.currentRowIndex  = 0;
			else if(this.currentRowIndex>max)
				this.currentRowIndex = max;
				
			if(this.isVertical){
				var y = this.currentRowIndex*this.iconHeight;
				this.css3move(this.container, {x:0, y:y}, time);
				this.moveStartY = y;
			}
			moveBG(this.isBGMovable, {x:0,y:y});
		},
		css3move: function(el, distance, time){
			time = time || 0;
			el.style.webkitTransform = 'translate3d('+ distance.x +'px, -' + distance.y + 'px,0)';
			el.style.webkitTransitionDuration = time + 'ms';
			el.style.webkitBackfaceVisiblity = 'hidden';
			el.style.webkitTransformStyle = 'preserve-3d';
			el.style.webkitTransitionTimingFunction = 'cubic-bezier(0.33,0.66,0.66,1)';
		},
		addPage: function(amount){
			this.pagesCount += amount;
			this.pagesCount = this.pagesCount || 1;
			this.styleApp();
		},
		//notifacation releated issues.
		notify: function(){
			
		},
		initDragEvent: function(e){
			var event = document.createEvent("Events");
			event.initEvent("drag", true, true);
			e.target.dispatchEvent(event);
		}
	});
	
	/* 
		leave space for a widget to open.
		the data structure of widgetSize:
		size : {
			width: 2, // equals to 2 application blocks in width
			height: 2 // equals to 2 application blocks in height
			}
		direction // which direction the widget are stretching to.
	*/
	var yield = function(elPos, widgetSize, direction){
		if(widgetSize && elPos>0){
			if(widgetSize.width == 2 && widgetSize.width == 2){
				//use the block** function , but switch the context to the global system.
				this.yield.block22.apply(this, arguments);
			}
			else if(widgetSize.width == 4 && widgetSize.height == 1){
				this.yield.block14.apply(this, arguments);
			}else if(widgetSize.width == 3 && widgetSize.height == 1){
				this.yield.block13.apply(this, arguments);
			}
		}
	}
	/*
		yield has a prototype also, yield dispatch the work to its corresponding child according to the widget size.
		This is a usage of command design pattern.
		the entire structure:
		base.prototype.yield:
			base.prototype.yield.block22 // means block 2*2 widget's yield method.
			base.prototype.yield.block14 // means block 1*4 widget's yield method.
			and so on.
	*/
	yield.block22 = function(elPos, widgetSize, direction){
		var icons = this.queue;	
		var remainder = elPos%this.appsPerRow;
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
					this.moveQueue(elPos, elPos-4);
					debug.log("right top blank");
				}
			}
			else if(str.substr(4,3) === "000"){
				if(remainder == 1){
					this.moveQueue(elPos, elPos-5);
					debug.log("left top blank");
				}
			}
			else{
				// level 4: compare left/right blank spaces under the element, stretch to more spaces area.
				// str.substr(*, *) + '0' avoids the match function returns null.
				if((str.substr(0,3)+'0').match(/0/ig).length < (str.substr(6,3)+'0').match(/0/ig).length){
					if(remainder != 1){
						this.moveQueue(elPos, elPos-1);
						debug.log("right down blank");
						icons = down(this, icons, elPos, widgetSize) || icons;
					}
				}
				else{
					if(remainder!=0){
						debug.log("left down blank");
						icons = down(this, icons, elPos, widgetSize) || icons;
					}
				}
			}
		}
		else{
			icons = down(this, icons, elPos, widgetSize) || icons;
		}
		// log the new queue of apps.
		this.queue = icons;
	};
	
	/*
		push the applications which block widget's space downward.
		according to the widget's width, make a tiny loop each line
		according to the widget's height, calculate the vertical distance to move.
		from back to forth
	*/
	// a function of an object was called , the object was passed to the function as 'this', if the object can't be identified, window was passed just as the following function.
	function down(that, icons, elPos, widgetSize){
		if(!icons){
			return false;
		}
		var vSpace,spaceCount=0;
		var pos;
		// if the app is in the 4th column, then stretch to right.
		if(elPos % that.appsPerRow == 0){			
			that.switchQueue(elPos, elPos-1);
			elPos -= 1;
		}
		for(var i=0; i<widgetSize.width; i++){
			// the state when i equals to 0
			if(!i){
				vSpace = widgetSize.height - 1;
				pos = elPos+that.appsPerRow;
				while(spaceCount<vSpace){
					if(!icons[pos-1]){
						spaceCount ++;
					}
					pos += that.appsPerRow;
				}
				spaceCount = 0;
				pos -= that.appsPerRow;
				while(pos>elPos){
					if(icons[pos-1]){
						that.moveQueue(pos, pos+spaceCount*that.appsPerRow);
					}
					else{
						spaceCount ++;
					}
					pos -= that.appsPerRow;
				}
			}
			else{
				pos = elPos + i;
				vSpace = widgetSize.height;
				while(spaceCount<vSpace){
					if(!icons[pos-1]){
						spaceCount ++;
					}
					pos += that.appsPerRow;
				}
				spaceCount = 0;
				pos -= that.appsPerRow;
				while(pos>elPos){
					if(icons[pos-1]){
						that.moveQueue(pos, pos+spaceCount*that.appsPerRow);
					}
					else{
						spaceCount ++;
					}
					pos -= that.appsPerRow;	
				}
			}
			spaceCount = 0;
		}
		return icons;
	}
	yield.block14 = function(){
		
	};
	yield.block13 = function(){
	
	};
	
	base.extend(base.fn, {yield:yield});
	
	// create slidebar, control it.
	base.extend(base.fn, {
		sideBar: function(isShow){
			if(!this.sidebar && isShow){
				var sidebar = document.createElement("div");
				sidebar.style.position = "absolute";
				var appScreen = document.getElementById("appScreen");
				if(this.isVertical){
					sidebar.style.right = "1px";
					sidebar.style.width = "4px";
					sidebar.style.height = (appScreen.clientHeight/this.pagesCount)+"px";
					
				}else{
					sidebar.style.bottom = "1px";
					sidebar.style.height = "4px";
					sidebar.style.width = (appScreen.clientWidth/this.pagesCount)+"px";
				}
				sidebar.style.backgroundColor = "black";
				sidebar.style.opacity = "0.4";
				sidebar.style.borderRadius = "3px";
				sidebar.style.zIndex = "99";
				appScreen.appendChild(sidebar);
				this.sidebar = sidebar;
			}else if(this.sidebar && isShow){
				this.sidebar.style.display = "block";
			}else{
				var that = this;
				setTimeout(function(){
					that.sidebar.style.display = "none";
				},1000);
			}
		}
	});
	
	// action definition when drag event fires.
	base.extend(base.fn, {
		highlightBox: null,
		dragStart: function(e){
			var target = e.target;
			this.rowIndexMem = this.currentRowIndex;
			
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
				this.isDragging = true;
				this.target = target;
				// fires an drag event.
				this.initDragEvent(e);	
			}else if(target.getAttribute('iWidget')){
				this.isDragging = true;
				this.target = target;
				// fires an drag event.
				this.initDragEvent(e);	
			}
			
			for(var j=0; j<this.queue.length; j++){
				if(this.queue[j]&&(this.queue[j].id === this.target.id || this.queue[j].id === this.target.getAttribute("iWidget")))
					this.from = j+1;
			}			
			// if the app moves out of favorite tray, or moves into the favorite , or just in iconContainer.
			this.isActionOut(target);
		},
		dragMove: function(e){
			if(!this.isDragging){
				return ;
			}				
			var that = this;
			var pagex = this.endX = e.touches[0].pageX;
			var pagey = this.endY = e.touches[0].pageY;			
			var iconHeight = this.iconHeight;
			var iconWidth = this.iconWidth;			
			/*
				calculate the row and column of position where you moved to.
				the following two 0.4 are used to correct the app's top-left corner to the center.
			*/
			var row = Math.round(pagey/iconHeight+0.4); //25% height
			var column = Math.round(pagex/iconWidth+0.4); //25% width
			if(this.isVertical){
				// differnet coordinate system, iconContainer and tray. so use two method.
				if(this.actionOut){
					this.target.style.left = (pagex-iconWidth/2) + "px";
					this.target.style.top  = (pagey-iconHeight/2) - iconHeight*this.appsPerColumn+ "px";
				}else{
					this.target.style.left = (pagex-iconWidth/2)+ "px";
					this.target.style.top  = (pagey-iconHeight/2)+this.currentRowIndex*iconHeight + "px";
					if(this.targetMem){
						this.targetMem.style.left = (pagex-iconWidth/2) + "px";
						this.targetMem.style.top  = (pagey-iconHeight/2) - iconHeight*this.appsPerColumn+ "px";
					}
				}
			}						
			if(that.isVertical){
				// decide if user wants to drag to next page or not.
				if(pagey>iconHeight*3.5 && pagey<iconHeight*4){
					clearTimeout(this.timeout);
					this.timeout = setTimeout(function(){
						if(that.currentRowIndex+1 < that.pagesCount*that.appsPerColumn){
							that.slideToPage(1, 100);
						}
					}, 1000);
				}else if(pagey<iconHeight*0.2){
					clearTimeout(this.timeout);
					this.timeout = setTimeout(function(){
						if(that.currentRowIndex > 0){
							that.slideToPage(-1, 100);
						}
					}, 1000);
				}
				else if(pagey>=iconHeight*4){
					clearTimeout(this.timeout);
					// !that.actionIn : only move the app into the tray once. deny the other request.
					// !that.actionOut: the target app node is not in the tray
					if((!that.actionOut) && (!that.actionIn)){
						that.moveInTray();
					}
				}
				else{
					clearTimeout(this.timeout);
					row = row||1;
					if(row>4){
						this.to = false;
					}else{
						row += this.currentRowIndex;
						this.to = (row-1)*4+column;
					}
				}
			}			
			
			// a green box indicates ok, a red box indicates you can't put application there.
			if(typeof this.to == "number"){
				this.highlight(iconWidth);			
				this.exchangeOnMove(pagey);
			}else{				
				this.highlight(false);	
			}
		},
		dragEnd: function(e){
			clearTimeout(this.timeout);
			clearTimeout(this.timeout2);
			if(!this.isDragging){
				return ;
			}else {
				/*
				this.target.style.webkitAnimationName = "";
				this.target.style.webkitAnimationIterationCount = "";		
				*/
				this.target.style.webkitTransform = "";
				this.highlight(false);
			}			
			if(this.actionIn){
				this.endToIn(this.endY);
			}
			else if(this.actionOut){
				if(!this.queue[this.to-1]){
					this.moveOutTray();
					this.endToOut(true);
				}else{				
					this.endToOut(false);
				}
			}
			else{
				var from = this.from;
				if(typeof(this.to)=="number"){
					var des = this.to-1;
					// drag within one page.
					if(this.rowIndexMem == this.currentRowIndex){
						this.switchQueue(from, this.to);
					}else{
						// drag to next page: if the desination gets an app,you are denied, else ok.
						if(this.queue[des]){
							this.target.style.left = ((from-1)%this.appsPerRow)*(100/this.appsPerRow)+"%";
							this.target.style.top = Math.floor((from-1)/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
						}else{
							this.moveQueue(from, this.to);
						}
					}
					// restroe its default value.
					this.target.style.zIndex = "";					
				}else{					
					this.target.style.left = ((from-1)%this.appsPerRow)*(100/this.appsPerRow)+"%";
					this.target.style.top = Math.floor((from-1)/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
				}
			}
			this.isDragging = false;
			this.to = false;
			this.from = false;
			this.toMem = false;
		},
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
		//find the widget location, where it should be displayed.
		locateWidget: function(wgt, top, left){
			var widget = this.widgets[wgt].widget;
			widget.style.left = left;
			widget.style.top = top;
		},
		//show whether the app can be dragged to the target location. red for no, green for yes.
		highlight: function(sideLen){			
			var des = this.to - 1, i;
			if(!this.highlightBox){
				var div = document.createElement("div");
				div.style.height = sideLen*0.66 + "px";
				div.style.width = sideLen*0.66 + "px";
				div.style.marginTop = sideLen/4 +"px";
				div.style.marginLeft = sideLen/6 +"px";
				div.style.position = "absolute";
				div.style.display = "none";
				this.container.appendChild(div);
				this.highlightBox = div;
			}else if(sideLen !== false){
				this.highlightBox.style.display = "block";				
				this.highlightBox.style.left = (des%this.appsPerRow)*(100/this.appsPerRow)+"%";
				this.highlightBox.style.top = Math.floor(des/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
				if(this.actionOut || this.rowIndexMem != this.currentRowIndex){
					if(this.queue[des]){
						this.highlightBox.style.webkitBoxShadow = "0 0 5px 2px red";
					}else{
						this.highlightBox.style.webkitBoxShadow = "0 0 5px 2px green";
					}
				}else{
					this.highlightBox.style.webkitBoxShadow = "0 0 5px 2px green";
				}
			}else{
				this.highlightBox.style.display = "none";
				return "closed";
			}
		},
		exchangeOnMove: function(pagey){
			clearTimeout(this.timeout2);
			this.timeout2 = setTimeout(function(){
				if(!this.actionOut && this.rowIndexMem == this.currentRowIndex && pagey<this.iconHeight*4){
					this.switchQueue(this.from, this.to);
					this.from = this.to;
				}
			}.bind(this), 300);
		},
		//find the app area's height and width
		calculate: function(){
			if(this.iconWidth&&this.iconHeight){
				return false;
			}
			var icons = this.container.getElementsByClassName("icon");
			var i = 0;
			while((!icons[i].clientWidth) && (!icons[i].clientHeight)){
				i++;
			}
			this.iconWidth = icons[i].clientWidth;
			this.iconHeight = icons[i].clientHeight;
			return true;
		}
	});
	
	//add some assistance APIs: event listener, event dispatcher.
	base.extend(base.fn, {
		listen: function(node, event, func, bool){
			try{
				if(typeof node=="object" && node.nodeType ==1 && ['click','dbclick','swipe','longtap','drag','pinch','touchstart','touchmove','touchend','touchcancel'].indexOf(event)!=-1){
					node.addEventListener(event, func, bool);
				}
				else{
					throw "wrong arguments, or event is not supported.";
				}
			}
			catch(error){
				console.log(error);
			}
		},
		fire: function(element, event){
			var e = document.createEvent("Events");
			e.initEvent(event, true, true);
			e.target = element;
			element.dispatchEvent(e);
		}
	});
	//some apps get widgets, so this is the way manage them.
	base.extend(base.fn, {
		widgets: {},
		require: function(widget){
			var wdt = document.createElement("script");
			wdt.src = widget;
			wdt.type= "text/javascript";
			document.head.appendChild(wdt);
		},
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
		}
	});
	
	//logic about the favorite tray. 
	base.extend(base.fn, {
		tray: null,
		targetMem: null,
		actionIn: false,
		actionOut: false,
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
			this.tray = div;
			document.body.appendChild(div);		
		},
		moveInTray: function(){
			var target = this.target.cloneNode(true);
			target.style.top = "0";
			target.style.height = "100%";
			target.style.width = "20%";
			this.tray.appendChild(target);
			this.target.style.display = "none";
			this.actionIn = true;			
			this.targetMem = target;
			if(this.checkFull()){
				this.to = this.from;
			}
		},
		endToIn: function(pagey){
			if(pagey>=this.iconHeight*4 && (!this.checkFull())){
				this.delQueue(this.from);
				this.container.removeChild(this.target);
				this.target = this.targetMem;
			}else{
				this.switchQueue(this.from, this.to);
				this.tray.removeChild(this.targetMem);
				this.target.style.display = "block";
			}
			this.targetMem = null;
			this.actionIn = false;
			this.arrange();
		},
		checkFull: function(){
			var icons = this.tray.getElementsByClassName("icon");
			if(icons.length<6){
				return false;
			}else{
				return true;
			}
		},
		//refresh all apps in the tray.
		arrange: function(){
			var icons = this.tray.getElementsByClassName("icon");
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
			this.targetMem = target;
		},
		//delete target from container and modify queue of the apps list.
		endToOut: function(isSuccess){
			if(typeof isSuccess == 'boolean' && isSuccess){
				var des = this.to-1;
				this.tray.removeChild(this.target);
				this.target = this.targetMem;
				this.queue[des] = this.target;
				this.target.style.left = (des%this.appsPerRow)*(100/this.appsPerRow)+"%";
				this.target.style.top = Math.floor(des/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
				this.target.style.height = 100/(this.pagesCount*this.appsPerColumn) + "%";
				this.target.style.width = "25%";				
			}
			this.targetMem = null;
			this.arrange();
			this.actionOut = false;
			this.restoreEvent();
		},
		isActionOut: function(target){
			try{
				if(target.parentNode.id == "tray"){
					this.actionOut = true;
				}
				else{
					this.actionOut = false;
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
	
	//
	// some sound effect
	// including some basic process function.
	// loadAudio: load the music file and init it.
	// playAudio: play music
	// pauseAudio: pause the playing music
	// volumeup/volumedown: control the volume.
	//
	base.Sound = base.extend( base.Sound, {
		audio: [],
		loadAudio: function(src){
			var audio = new Audio(src);
			audio.preload = "auto";
			this.audio.push(audio);
		},
		playAudio: function(index){
			this.audio[index].play();
		},
		pauseAudio: function(index){
			this.audio[index].pause();
		},
		volumeup: function(index){
			this.audio[index].volume += 0.1;
		},
		volumedown: function(index){
			this.audio[index].volume -= 0.1;
		}		
	});
	
	//
	// a brief version information
	//
	
	base.Version = base.extend( base.Version, {
		version: '2.1.3 beta',
		showVersion: function(){
			base.Debug.log('Version: '+this.version);
			return this.version;
		}
	});
	
	// 
	// Ajax module
	// containing two main query method, GET and POST
	// query string in post method are transfered as form-data.
	//
	base.Ajax = base.extend(base.Ajax, {
		ajax:function(url, callback){
			var xmlhttp = new XMLHttpRequest();			
			xmlhttp.open('GET', url, true);
			xmlhttp.send();
			xmlhttp.onreadystatechange = function(){
				if(xmlhttp.status == 200){
					try{
						if(xmlhttp.responseXML){
							this.getResponseXML(xmlhttp.responseXML);
							if(typeof callback == 'function')
								callback(xmlhttp.responseXML);
						}else if(xmlhttp.responseText){
							this.getResponseStr(xmlhttp.responseText);
							if(typeof callback == 'function')
								callback(xmlhttp.responseText);
						}
						else{
							throw "The server response with no valuable entity.";
						}
					}
					catch(message){
						debug.log(message);
					}
				}
			}.bind(base.Ajax);
		},
		getResponseStr: function(str){			
			console.log(str);
		},
		getResponseXML: function(xml){
			console.log(xml.getElementsByTagName('*')[0].nodeValue);
		},
		//the arguments list are lined by their improtance level.
		get: function(url,  queryStr, isAsy, callback){
			var xmlhttp = new XMLHttpRequest(), bool;
			if(typeof isAsy == "boolean")
				bool = isAsy;
			else
				bool = true;
			
			url = url+"?"+queryStr;
			xmlhttp.open('GET', url, bool);
			xmlhttp.send();
			xmlhttp.onreadystatechange = function(){
				if(xmlhttp.status == 200){
					try{
						if(xmlhttp.responseXML){
							this.getResponseXML(xmlhttp.responseXML);
							if(typeof callback == 'function')
								callback(xmlhttp.responseXML);
						}else if(xmlhttp.responseText){
							this.getResponseStr(xmlhttp.responseText);
							if(typeof callback == 'function')
								callback(xmlhttp.responseText);
						}
						else{
							throw "The server response with no valuable entity.";
						}
					}
					catch(message){
						debug.log(message);
					}
				}
			}.bind(base.Ajax);
		},
		post: function(url, queryStr, isAsy, callback){
			var xmlhttp = new XMLHttpRequest(), bool;
			if(typeof isAsy == "boolean")
				bool = isAsy;
			else
				bool = true;
			var data = "";
			if(typeof queryStr == "object")
				data = JSON.stringify(queryStr);
			else if(typeof queryStr == "string")
				data = queryStr;
			
			xmlhttp.open('POST', url, bool);			
			xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			xmlhttp.send(data);
			xmlhttp.onreadystatechange = function(){
				if(xmlhttp.status == 200){
					try{
						if(xmlhttp.responseXML){
							this.getResponseXML(xmlhttp.responseXML);
							if(typeof callback == 'function')
								callback(xmlhttp.responseXML);
						}else if(xmlhttp.responseText){
							this.getResponseStr(xmlhttp.responseText);
							if(typeof callback == 'function')
								callback(xmlhttp.responseText);
						}
						else{
							throw "The server response with no valuable entity.";
						}
					}
					catch(message){
						debug.log(message);
					}
				}
			}.bind(base.Ajax);
		}
	});
	
	return base;
})(window);

// sprite image Movie player 
var spriteMovie = (function(){
	function spriteMovie(imgSrc, flashWindowConf, movieArray){
		this.imgSrc = imgSrc;
		this.flashWindow = flashWindowConf;
		this.movieArray = movieArray;
		this.loadImage(imgSrc);
	}
	
	spriteMovie.prototype = {
		isImageLoad: false,
		isbgset: false,
		loadImage: function(imgSrc, callback){
			var img = new Image();
			img.src = imgSrc;
			var that = this;
			img.onload = function(){
				console.log("image load completed!");
				that.isImageLoad = true;
				if(callback && typeof callback == "function"){
					callback();
				}
				var notice = document.getElementById("notice");
				if(notice){
					notice.innerHTML = "Load completed!";
				}
			}
		},
		setFlashWindow: function(config, movieArray, startPos){
			config.el.style.width = config.width+"px";
			config.el.style.height = config.height+"px";
			var that = this;
			var bgInterval = setInterval(function(){
				if(that.isImageLoad){
					config.el.style.background = "url("+that.imgSrc+") top left no-repeat";
					config.el.style.backgroundPosition = "-"+ movieArray[startPos].left +"px -"+ movieArray[startPos].top +"px";
					that.isbgset = true;
					if(that.wantPlayFps){
						that.play(that.wantPlayFps);
						that.wantPlayFps = 0;
					}else if(that.wantRewindFps){
						that.rewind(that.wantRewindFps);
						that.wantRewindFps = 0;
					}
					clearInterval(bgInterval);
				}
			},10);
		},
		play: function(fps){
			this.setFlashWindow(this.flashWindow, this.movieArray, 0);
			fps = fps || 16;
			var time = 1000/fps;
			this.wantPlayFps = fps;
			if(this.isbgset){
				this.wantPlayFps = 0;
				var that = this;
				this.frame = this.frame || 0;
				clearInterval(this.start);
				this.start = setInterval(function(){
					that.flashWindow.el.style.backgroundPosition = "-"+that.movieArray[that.frame].left + "px -" +that.movieArray[that.frame].top+"px";
					that.frame==(that.movieArray.length-1) ? (that.frame=0,that.stop()):(that.frame ++);
				}, time);
			}
		},
		stop: function(){
			if(this.start){
				clearInterval(this.start);
				this.frame = 0;
			}
		},
		pause: function(){
			if(this.start){
				clearInterval(this.start);
			}
		},
		rewind: function(fps){
			this.setFlashWindow(this.flashWindow, this.movieArray, this.movieArray.length-1);
			fps = fps || 16;
			var time = 1000/fps;
			this.wantRewindFps = fps;
			if(this.isbgset){
				this.wantRewindFps = 0;
				var that = this;
				var frame = (this.movieArray.length-1);
				clearInterval(this.start);
				this.start = setInterval(function(){
					that.flashWindow.el.style.backgroundPosition = "-"+that.movieArray[frame].left + "px -" +that.movieArray[frame].top+"px";
					if(frame == 0){
						if(that.callback){
							console.log("call back");
							that.callback();
						}
						clearInterval(that.start);								
					}
					else{
						frame --;
					}
				}, time);
			}
		}
	};
	return spriteMovie;
})();

var system = new _Base_("iconsContainer",{isVertical:true, appsPerRow:4, appsPerColumn:4});

// avoid the 'undefined' error when native code this function.
function updateContent(){}

window.addEventListener("gestureend", function(){
	console.log("getsteure");
}, false);

window.addEventListener("swipe", function(e){
	//console.log(e.data.direction);
}, false);
window.addEventListener("pinch", function(e){
	if(e.scale > 1){
		console.log("pinch to larger");
	}else{
		console.log("pinch to smaller");
	}
}, false);