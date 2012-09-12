var _Base_ = (function(window, undefined){
	/*
		make the following three api can't be access out of the scope.
	*/	
	var getAppsList = function(){
		// Don't use JSON.parse, 'cause chinese characters without slashes cause errors.
		return eval(window.nativeapps.getAppsListInJson());
	};
	var getDefaultIconUri = function(){
		// If the icons aren't prepared, use a default icon.
		return window.nativeapps.getDefaultAppIconUri();
	};
	//identification is like this: com.orange.browser/com.a.b
	var launchApp = function(identification){
		// identification stands for the id of appliction div, which is like : com.*.*/com.*.*.*Activity
		var array = identification.split('/');
		var pkg = array[0];
		var cls = array[1];
		// native interface, two arguments: package name and activity name.
		window.nativeapps.launchActivity(pkg, cls);
	};
	
	var removeAllChild = function(node){
		if(typeof node == "object" && node.nodeType == 1){
			while(node.firstChild){
				node.removeChild(node.firstChild);
			}
		}
	};
	
	// parse to float
	var toNum = function(arg){
		var result = parseFloat(arg);
		if(isNaN(result)){
			result = 0;
		}
		return result;
	}
	
	// add a API debug, for logging info
	// debug is working for debug the program. Note: don't log large object in deepth like window/document, may exceed the stack size, and get error.
	var debug = function(){
		try{
			var str = debug.concat.apply(this, arguments).slice(0, -1);
			console.log(str);
			return str;
		}
		catch(error){
			console.log(error);
		}
	};
	debug.concat = function(){
		var str="";
		for(var i=0; i<arguments.length; i++){
			var type = toString.call(arguments[i]);
			if(type.indexOf('Object') != -1){
				str += '{';
				for(var j in arguments[i]){
					str += j+':'+debug.concat(arguments[i][j]);
				}
				if(str[str.length-1] != '{')
					str = str.substr(0, str.length-1);
				str += '},';
			}
			else if(type.indexOf('Array') != -1){
				str += '[';
				for(var n=0; n<arguments[i].length; n++){
					str +=  debug.concat(arguments[i][n]);
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
	
	var base = function(container, config){
		var that = this;	
		window.addEventListener('load',function(){
			if(typeof container == "string"){
				that.container = document.getElementById(container);
			}
			else if(typeof container == "object" && container.nodeType == 1){
				that.container = container;
			}
			//copy the configs into the base's prototype.
			if(config && typeof config == "object"){
				for(var i in config){
					that[i] = config[i];
				}
			}
			document.body.addEventListener("touchstart", function(e){
				that.touchstart(e);
			}, false);
			document.body.addEventListener("touchmove", function(e){
				that.touchmove(e);
			}, false);
			document.body.addEventListener("touchend", function(e){
				that.touchend(e);
			}, false);
			document.body.addEventListener("touchcancel", function(e){
				that.touchcancel(e);
			}, false);
			document.body.addEventListener("click", function(e){
				that.click(e);
			}, false);
			// It's a flag to direct the widgets' action.
			that.isWidgetShow = false;
			// add the favorite tray area.
			that.addFixedArea();
			// some sound effect.
			that.loadAudio("./mp3.mp3");
			// launch the system, init all components.
			that.run();
		}, false);
	};
	base.prototype = {
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
		run: function(){
			// keep trying to get all resources until success.			
			var that = this;
			var index = setInterval(function(){
				var apps = that.loadRes();
				var len = apps.length;
				that.init();
				if(apps[len-1].iconUri && apps[len-1].label){
					clearInterval(index);
				}
			}, 1000);						
		},
		// parse the applications' JSON info and then register them.
		loadRes: function(){
			this.queue = [];
			this.appsCount = 0;
			this.pagesCount = 0;
			this.container.innerHTML = "";	 	//removeAllChild(this.container); //both methods are ok.
			var apps, defaultUri = getDefaultIconUri();
			apps = getAppsList();
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
			return apps;
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
				this.addWidget(app.widget ,appNode);
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
	
	base.fn = base.prototype;
	base.fn.extend = function(){
		var values = [];
		if(arguments.length == 1){
			var target = this;
			if(typeof arguments[0] == "object"){
				for( var name in arguments[0]){
					target[name] = arguments[0][name];
					values.push(arguments[0][name]);
				}
				return values;
			}
		}
	};
	
	//extend debug to base.prototype and base itself
	base.debug = base.fn.extend({debug: debug})[0];
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
	
	base.fn.extend({
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
				var that = this;
				this.longTapIndex = setTimeout(function(){
					var event = document.createEvent("Events");
					event.initEvent("longtap", true, true);
					e.target.dispatchEvent(event);
					that.longtapStart = true;
					that.dragStart(e);							
					that.sideBar(false);
				}, 1000);
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
						launchApp(target.id);
						console.log(target.id);
						that.playAudio(0);
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
		var lineHeight = 100/(this.appsPerColumn*this.pagesCount);
		var remainder = elPos%this.appsPerRow;
		// Assume every row gets 4 apps but 1 or 2 or 3 apps.
		var counter = this.appsCount - this.appsCount%this.appsPerRow + remainder;
		
		/*
			push the applications which block widget's space downward.
			according to the widget's width, make a tiny loop each line
			according to the widget's height, calculate the vertical distance to move.
			from back to forth
		*/
		var that = this;
		// why use that for this?
		// a function of an object was called , the object was passed to the function as 'this', if the object can't be identified, window was passed like the following function.
		function down(){
			while(counter >= elPos){
				for(var i=0; i<widgetSize.width; i++){
					// if the widget is 2*2 and its app is in the 4th column, scretch to left, or stretch to right
					if(elPos%that.appsPerRow == 4){
						var nth = counter-i;
					}else{
						nth = counter+i;
					}
					
					// the apps which is right under the app(whose widget is opening) move one block less downward 
					if(icons[nth-1] && (nth != elPos)){
						if(nth%that.appsPerRow == remainder){
							that.moveQueue(nth, nth+(widgetSize.height-1)*that.appsPerRow);
						}
						else{
							that.moveQueue(nth, nth+widgetSize.height*that.appsPerRow);
						}
					}
				}
				counter -= that.appsPerRow;
			}
		}
		
		// calculate where to display the widget
		// level 1: the element is in the first row or not
		if(elPos > 4){
			// level 2: the element is in the 1st column or the 4th column or the other two columns.
			if(remainder == 1){
				if((!icons[elPos-1-4]) && (!icons[elPos-4]) && (!icons[elPos])){
					this.moveQueue(elPos, elPos-4);
				}else{
					down();
				}
			}
			else if(remainder == 0){
				if((!icons[elPos-1-4]) && (!icons[elPos-1-5]) && (!icons[elPos-1-1])){
					this.moveQueue(elPos, elPos-5);
				}
				else{
					down();
				}
			}
			else{
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
					this.moveQueue(elPos, elPos-4);
					debug("right top blank");
				}
				else if(str.substr(4,3) === "000"){
					this.moveQueue(elPos, elPos-5);
					debug("left top blank");
				}
				else{
					// level 4: compare left/right blank spaces under the element, stretch to more spaces area.
					// str.substr(*, *) + '0' avoids the match function returns null.
					if((str.substr(0,3)+'0').match(/0/ig).length < (str.substr(6,3)+'0').match(/0/ig).length){
						this.moveQueue(elPos, elPos-1);
						debug("right down blank");
						down();
					}
					else{
						debug("left down blank");
						down();
					}
				}
			}	
		}
		else{
			down();
		}
		// log the new queue of apps.
		this.queue = icons;
	};
	yield.block14 = function(){
		
	};
	yield.block13 = function(){
	
	};
	
	base.fn.extend({yield:yield});
	
	// create slidebar, control it.
	base.fn.extend({
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
	base.fn.extend({
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
				target.style.webkitTransformOrigin="50% 50%";
				target.style.webkitAnimationDuration= ".5s";
				target.style.webkitAnimationName= "shake";
				target.style.webkitAnimationTimingFunction="ease";
				target.style.webkitAnimationIterationCount= "infinite";
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
			row = row||1;
			if(row>4){
				this.to = false;
			}else{
				row += this.currentRowIndex;
				this.to = (row-1)*4+column;
			}
			// a green box indicates ok, a red box indicates you can't put application there.
			this.highlight(iconWidth);
			
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
				}
			}
		},
		dragEnd: function(e){
			clearTimeout(this.timeout);
			if(!this.isDragging){
				return ;
			}else {				
				this.target.style.webkitAnimationName = "";
				this.target.style.webkitAnimationIterationCount = "";		
				this.highlight(false);
			}			
			for(var j=0; j<this.queue.length; j++){
				if(this.queue[j]&&(this.queue[j].id === this.target.id || this.queue[j].id === this.target.getAttribute("iWidget")))
					this.from = j+1;
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
					// relocate the widgets of an app which is just moved.
					if(this.target.getAttribute("isWidget")){
						this.locateWidget(this.target.id, this.target.style.top, this.target.style.left)
					}
				}else{					
					this.target.style.left = ((from-1)%this.appsPerRow)*(100/this.appsPerRow)+"%";
					this.target.style.top = Math.floor((from-1)/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
				}
			}
			this.isDragging = false;
			this.to = false;
			this.from = false;
		},
		//the following three functions work for managing the queue of all apps.
		switchQueue: function(from, to){
			if(from != to){
				var nthF = from-1, nthT = to-1;
				this.queue[nthF].style.left = (nthT%this.appsPerRow)*(100/this.appsPerRow)+"%";
				this.queue[nthF].style.top = Math.floor(nthT/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
				if(this.queue[nthT]){
					this.queue[nthT].style.left = (nthF%this.appsPerRow)*(100/this.appsPerRow)+"%";
					this.queue[nthT].style.top = Math.floor(nthF/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
				}
				var tmp = this.queue[nthT];
				this.queue[nthT] = this.queue[nthF];			
				this.queue[nthF] = tmp;					
			}
		},
		moveQueue: function(from, to){
			if(from != to){
				var nthF = from-1, nthT = to-1;				
				this.queue[nthF].style.left = (nthT%this.appsPerRow)*(100/this.appsPerRow)+"%";
				this.queue[nthF].style.top = Math.floor(nthT/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
				this.queue[nthT] = this.queue[nthF];
				this.queue[nthF] = undefined;
			}
		},
		delQueue: function(from){
			this.queue[from-1] = undefined;
		},
		//show whether the app can be dragged to the target location. red for no, green for yes.
		highlight: function(sideLen){
			if(sideLen === false && this.highlightBox){
				this.highlightBox.style.display = "none";
				return "closed";
			}
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
			}else{
				var des = this.to - 1;
				this.highlightBox.style.display = "block";
				if(this.rowIndexMem == this.currentRowIndex && (!this.actionOut)){
					this.highlightBox.style.left = (des%this.appsPerRow)*(100/this.appsPerRow)+"%";
					this.highlightBox.style.top = Math.floor(des/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
					this.highlightBox.style.webkitBoxShadow = "0 0 5px 2px green";
				}
				else{
					if(this.queue[des]){
						this.highlightBox.style.left = (des%this.appsPerRow)*(100/this.appsPerRow)+"%";
						this.highlightBox.style.top = Math.floor(des/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
						this.highlightBox.style.webkitBoxShadow = "0 0 5px 2px red";
					}else{						
						this.highlightBox.style.left = (des%this.appsPerRow)*(100/this.appsPerRow)+"%";
						this.highlightBox.style.top = Math.floor(des/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
						this.highlightBox.style.webkitBoxShadow = "0 0 5px 2px green";
					}
				}
			}
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
			debug(this.iconWidth, "           ", this.iconHeight);
			return true;
		}
	});
	
	//add some assistance APIs: event listener, event dispatcher.
	base.fn.extend({
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
	base.fn.extend({
		widgets: {},
		addWidget: function(widget, el){
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
		},
		//find the widget location, where it should be displayed.
		locateWidget: function(wgt, top, left){
			var widget = this.widgets[wgt].widget;
			widget.style.left = left;
			widget.style.top = top;
		}
	});
	
	//logic about the favorite tray. 
	base.fn.extend({
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
			if(!this.checkFull()){
				var target = this.target.cloneNode(true);
				this.tray.appendChild(target);
				this.target.style.display = "none";
				this.actionIn = true;			
				this.targetMem = target;
				this.arrange();
			}
		},
		endToIn: function(pagey){
			if(pagey>=this.iconHeight*4){
				this.delQueue(this.from);
				this.container.removeChild(this.target);
				this.target = this.targetMem;
			}else{
				var nth = this.to -1;
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
			if(icons.length>4){
				return true;
			}else{
				return false;
			}
		},
		//refresh all apps in the tray.
		arrange: function(){
			var icons = this.tray.getElementsByClassName("icon");
			var num = icons.length;
			var spacing = (100-20*num)/(num+1);
			for(var i=0; i<num; i++){
				icons[i].style.webkitAnimation = "";
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
				debug(error);
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
	
	//some sound effect
	base.fn.extend({
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
	//ajax module
	base.fn.extend({
		ajax:function(url, callback){
			var xmlhttp = new XMLHttpRequest();
			var that = this;
			xmlhttp.onreadystatechange = function(){
				if(xmlhttp.status == 200){
					try{
						if(xmlhttp.responseXML){
							that.getResponseXML(xmlhttp.responseXML);
							if(typeof callback == 'function')
								callback(xmlhttp.responseXML);
						}else if(xmlhttp.responseText){
							that.getResponseStr(xmlhttp.responseText);
							if(typeof callback == 'function')
								callback(xmlhttp.responseText);
						}
						else{
							throw "The server response with no valuable entity.";
						}
					}
					catch(message){
						debug(message);
					}
				}
			};
			xmlhttp.open('GET', url, true);
			xmlhttp.send();
		},
		getResponseStr: function(str){			
			console.log(str);
		},
		getResponseXML: function(xml){
			console.log(xml.getElementsByTagName('*')[0].nodeValue);
		},
		//the arguments list are lined by their improtance level.
		get: function(url, callback, isAsy){
			var xmlhttp = new XMLHttpRequest(), bool;
			var that = this;
			if(typeof isAsy == "boolean")
				bool = isAsy;
			else
				bool = true;
			xmlhttp.onreadystatechange = function(){
				if(xmlhttp.status == 200){
					try{
						if(xmlhttp.responseXML){
							that.getResponseXML(xmlhttp.responseXML);
							if(typeof callback == 'function')
								callback(xmlhttp.responseXML);
						}else if(xmlhttp.responseText){
							that.getResponseStr(xmlhttp.responseText);
							if(typeof callback == 'function')
								callback(xmlhttp.responseText);
						}
						else{
							throw "The server response with no valuable entity.";
						}
					}
					catch(message){
						debug(message);
					}
				}
			}
			xmlhttp.open('GET', url, bool);
			xmlhttp.send();
		},
		post: function(url, callback, queryStr, isAsy){
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
			
			xmlhttp.onreadystatechange = function(){
				if(xmlhttp.status == 200){
					try{
						if(xmlhttp.responseXML){
							that.getResponseXML(xmlhttp.responseXML);
							if(typeof callback == 'function')
								callback(xmlhttp.responseXML);
						}else if(xmlhttp.responseText){
							that.getResponseStr(xmlhttp.responseText);
							if(typeof callback == 'function')
								callback(xmlhttp.responseText);
						}
						else{
							throw "The server response with no valuable entity.";
						}
					}
					catch(message){
						debug(message);
					}
				}
			};
			xmlhttp.open('POST', url, bool);
			xmlhttp.send(data);
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