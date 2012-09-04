var _Base_ = (function(window, undefined){
	/*
		make the following three api can't be access out of the scope.
	*/	
	var getAppsList = function(){
		// Don't use JSON.parse, 'cause chinese characters without slashes cause errors.
		return eval(window.nativeapps.getAppsListInJson());
	};
	var getDefaultIconUri = function(){
		return window.nativeapps.getDefaultAppIconUri();
	};
	//identification is like this: com.orange.browser/com.a.b
	var launchApp = function(identification){	
		var pkg = identification.split('/')[0];
		var cls = identification.split('/')[1];
		console.log(pkg+"   "+cls);
		window.nativeapps.launchActivity(pkg, cls);
	};
	var removeAllChild = function(node){
		if(typeof node == "object" && node.nodeType == 1){
			while(node.firstChild){
				node.removeChild(node.firstChild);
			}
		}
	};
	
	var base = function(container, config){		
		var that = this;		
		window.addEventListener('load',function(){
			if(typeof container == "string"){
				that.container = document.getElementById(container);
			}
			else if(typeof container == "object" && container.nodeType == 1){
				that.container = container;
			}
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
			that.isWidgetShow = false;
			that.addFixedArea();
			that.loadAudio("./mp3.mp3");
			that.run();
		}, false);
	};
	base.prototype = {
		appStyle: null,
		startX: 0,
		startY: 0,
		pinchStartLen: 0,
		pinchEndLen: 0,
		longTapIndex: null,
		longtapStart: false,
		dbclickInterval: null,
		lastClickTime: 0,
		clickIndex: null,
		appsPerRow: 4,
		appsPerColumn: 4,
		appsCount: 0,
		pagesCount: 0,
		currentPageIndex: 0,
		movedDistance: 0,
		moveStartX: 0,
		moveStartY: 0,
		nextToEndX: 0,
		nextToEndY: 0,
		endX: 0,
		endY: 0,
		sidebar: null,
		lastMoveTime: undefined,
		stopTouchEnd: false,
		isVertical: false,
		isDragging: false,
		queue: [],
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
		touchstart: function(e){					
			this.sideBar(true);
			this.pinchEndLen = 0;
			this.longtapStart = false;
			if(e.touches.length === 1){
				this.startX = e.touches[0].pageX;
				this.startY = e.touches[0].pageY;
				
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
				this.pinchStartLen = Math.sqrt((e.touches[1].pageX-e.touches[0].pageX)*(e.touches[1].pageX-e.touches[0].pageX)+(e.touches[1].pageY-e.touches[0].pageY)*(e.touches[1].pageY-e.touches[0].pageY));
			}
		},
		touchmove: function(e){
			e.preventDefault();
			this.lastMoveTime = new Date;					
			clearTimeout(this.longTapIndex);
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
						var dis = {x:0, y:y};
						this.movedDistance = pagey-this.startY;				
						document.body.style.backgroundPosition = "0 " + (y*100/document.getElementById("iconsContainer").clientHeight)+"%";
						this.sidebar.style.top = (y*100/document.getElementById("iconsContainer").clientHeight)+"%";
					}
					else{
						var x = pagex-this.startX + this.moveStartX;					
						var maxWidth = document.getElementById("appScreen").clientWidth*(this.pagesCount-1)*-1;
						if(x>0)
							x=0;
						else if(x < maxWidth)
							x=maxWidth;
						var dis = {x:x, y:0};
						this.movedDistance = pagex-this.startX;					
						document.body.style.backgroundPosition = (-x*100/document.getElementById("iconsContainer").clientWidth)+"% 0%";						
						this.sidebar.style.left = (y*100/document.getElementById("iconsContainer").clientHeight)+"%";
					}
					this.css3move(this.container, dis);
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
			this.dragEnd(e);
			if(this.stopTouchEnd){
				this.stopTouchEnd = false;
				return ;
			}			
			if(!this.longtapStart){
				clearTimeout(this.longTapIndex);
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
					var lastMoveSpeed = Math.sqrt((this.endX-this.nextToEndX)*(this.endX-this.nextToEndX)+(this.endY-this.nextToEndY)*(this.endY-this.nextToEndY))/(new Date - this.lastMoveTime);
					var swipe = document.createEvent("Events");
					swipe.initEvent("swipe", true, true);
					swipe.data = {};
					swipe.data.direction = direction;
					swipe.data.endSpeed = lastMoveSpeed;
					e.target.dispatchEvent(swipe);
					this.endX = 0;
				}
			}				
			if(this.isVertical){
				var pageHeight = document.getElementById("appScreen").clientHeight;
				var percent = this.movedDistance / pageHeight;
				if((Math.abs(percent)>0.06  && lastMoveSpeed>0.3)||(Math.abs(percent)>0.5 && lastMoveSpeed<0.3)){
					if(percent>0 && this.currentPageIndex>0){
						var y = (this.currentPageIndex-1)*pageHeight;
						this.currentPageIndex -= 1;
					}
					else if(percent<0 && this.currentPageIndex<this.pagesCount-1){
						y = (this.currentPageIndex+1)*pageHeight;
						this.currentPageIndex += 1;
					}
					else {
						y = this.currentPageIndex*pageHeight;
					}
				}
				else{
					y = this.currentPageIndex*pageHeight;
				}			
				this.moveStartY = y;
				this.css3move(this.container, {x:0, y:y}, 100);
				document.body.style.backgroundPosition = "0% " + (100/this.pagesCount)*this.currentPageIndex+"%";				
				this.sidebar.style.top = (document.getElementById("appScreen").clientHeight/this.pagesCount)*this.currentPageIndex+"px";				
				this.sideBar(false);
			}
			else{
				var pageWidth = document.getElementById("appScreen").clientWidth;
				percent = this.movedDistance / pageWidth;				
				if((Math.abs(percent)>0.06  && lastMoveSpeed>0.3)||(Math.abs(percent)>0.5 && lastMoveSpeed<0.3)){
					if(percent>0 && this.currentPageIndex>0){
						var x = (this.currentPageIndex-1)*pageWidth*-1;
						this.currentPageIndex -= 1;
					}
					else if(percent<0 && this.currentPageIndex<this.pagesCount-1){
						x = (this.currentPageIndex+1)*pageWidth*-1;
						this.currentPageIndex += 1;
					}
					else {
						x = this.currentPageIndex*pageWidth*-1;
					}
				}
				else {
					x = this.currentPageIndex*pageWidth*-1;
				}			
				this.moveStartX = x;				
				this.css3move(this.container, {x:x, y:0}, 100);			
				document.body.style.backgroundPosition = (100/this.pagesCount)*this.currentPageIndex+"% 0%";
				this.sidebar.style.left = (document.getElementById("appScreen").clientWidth/this.pagesCount)*this.currentPageIndex+"px";
				this.sideBar(false);
			}			
		},
		touchcancel: function(e){
			this.touchend(e);
		},
		click: function(e){
			var that = this;
			var now = new Date;			
			var target = e.target;
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
					if(/[A-z0-9]+\./ig.test(target.id)){						
						launchApp(target.id);
						that.playAudio(0);
					}
				}, 400);
			}
			this.lastClickTime = now;			
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
		//switch the pages left/right or up/down.
		slideToPage: function(pageIndex, time){
			var pageWidth = document.getElementById("appScreen").clientWidth;
			var pageHeight = document.getElementById("appScreen").clientHeight;
			if(this.isVertical){
				var y = pageIndex*pageHeight;
				this.css3move(this.container, {x:0, y:y}, time);
				this.moveStartY = y;				
				document.body.style.backgroundPosition = "0% " + (100/this.pagesCount)*pageIndex+"%";
			}
			else{
				var x = pageIndex*pageWidth*-1;
				this.css3move(this.container, {x:x, y:0}, time);
				this.moveStartX = x;				
				document.body.style.backgroundPosition = (100/this.pagesCount)*pageIndex+"% 0%";
			}
			this.stopTouchEnd = true;
			this.currentPageIndex = pageIndex;
		},
		css3move: function(el, distance, time){
			time = time || 0;
			el.style.webkitTransform = 'translate3d('+ distance.x +'px, -' + distance.y + 'px,0)';
			el.style.webkitTransitionDuration = time + 'ms';
			el.style.webkitBackfaceVisiblity = 'hidden';
			el.style.webkitTransformStyle = 'preserve-3d';
			el.style.webkitTransitionTimingFunction = 'cubic-bezier(0.33,0.66,0.66,1)';
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
		},
		//notifacation releated issues.
		notify: function(){
			
		},
		yield: function(direction, blockNum){
			var elPos = this.elPos;
			elPos -= 1;
			var icons = this.queue;
			var lineHeight = 100/(this.appsPerColumn*this.pagesCount);
			if(direction == "down"){
				for(var i=1; i<blockNum; i++){
						if(icons[elPos+i])
							icons[elPos+i].style.top = (this.toNum(icons[elPos+i].style.top)+lineHeight)+"%";
				}
				while(icons[elPos]){
					for(var i=0; i<blockNum; i++){
						if(icons[elPos+4+i]){
							icons[elPos+4+i].style.top = (this.toNum(icons[elPos+4+i].style.top)+lineHeight)+"%";
						}
					}
					elPos += 4;
				}
			}
			else if(direction == "right"){
				while(icons[elPos]){
					for(var i=1; i<blockNum; i++){
						if(icons[elPos+i])
							icons[elPos+i].style.top = (this.toNum(icons[elPos+i].style.top)+lineHeight)+"%";
					}
					elPos += 4;
				}
			}
			else if(direction == "left"){
				while(icons[elPos]){
					for(var i=blockNum-1; i>0; i--){
						if(icons[elPos-i])
							icons[elPos-i].style.top = (this.toNum(icons[elPos-i].style.top)+lineHeight)+"%";
					}
					elPos += 4;
				}
			}
		},
		toNum: function(arg){
			var result = parseFloat(arg);
			if(isNaN(result)){
				result = 0;
			}
			return result;
		},
		withdraw: function(direction, blockNum){
			var elPos = this.elPos;
			elPos -= 1;
			var icons = this.queue;			
			var lineHeight = 100/(this.appsPerColumn*this.pagesCount);
			if(direction == "up"){
				for(var i=1; i<blockNum; i++){
						if(icons[elPos+i])
							icons[elPos+i].style.top = (this.toNum(icons[elPos+i].style.top)-lineHeight)+"%";
				}
				while(icons[elPos]){
					for(var i=0; i<blockNum; i++){
						if(icons[elPos+4+i]){
							icons[elPos+4+i].style.top = (this.toNum(icons[elPos+4+i].style.top)-lineHeight)+"%";
						}
					}
					elPos += 4;
				}
			}
			else if(direction == "left"){
				while(icons[elPos]){
					for(var i=1; i<blockNum; i++){
						if(icons[elPos+i])
							icons[elPos+i].style.top = (this.toNum(icons[elPos+i].style.top)-lineHeight)+"%";
					}
					elPos += 4;
				}
			}
			else if(direction == "right"){
				while(icons[elPos]){
					for(var i=blockNum-1; i>0; i--){
						if(icons[elPos-i])
							icons[elPos-i].style.top = (this.toNum(icons[elPos-i].style.top)-lineHeight)+"%";
					}
					elPos += 4;
				}
			}
		},
		initDragEvent: function(e){
			var event = document.createEvent("Events");
			event.initEvent("drag", true, true);
			e.target.dispatchEvent(event);
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
	}
	base.fn.extend({
		sideBar: function(isShow, pos){
			if(pos){
				if(this.isVertical){
					this.css3move(this.sidebar, {x:0, y:pos}, 100);
				}else{
					this.css3move(this.sidebar, {x:pos, y:0}, 100);
				}
				return true;
			}
			if(!this.sidebar && isShow){
				var sidebar = document.createElement("div");
				sidebar.style.position = "absolute";
				if(this.isVertical){
					sidebar.style.right = "1px";
					sidebar.style.width = "4px";
					sidebar.style.height = (document.getElementById("appScreen").clientHeight/this.pagesCount)+"px";
					
				}else{
					sidebar.style.bottom = "1px";
					sidebar.style.height = "4px";
					sidebar.style.width = (document.getElementById("appScreen").clientWidth/this.pagesCount)+"px";
				}
				sidebar.style.backgroundColor = "black";
				sidebar.style.opacity = "0.4";
				sidebar.style.borderRadius = "3px";
				sidebar.style.zIndex = "99";
				document.body.appendChild(sidebar);
				this.sidebar = sidebar;
			}else if(this.sidebar && isShow){
				this.sidebar.style.display = "block";
			}else{
				var that = this;
				setTimeout(function(){
					that.sidebar.style.display = "none";
				},500);
			}
		}
	});
	
	//action definition when drag event fires.
	base.fn.extend({
		highlightBox: null,
		dragStart: function(e){
			var target = e.target;
			this.pageIndexMem = this.currentPageIndex;
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
				this.isDragging = true;
				this.target = target;
			}else if(target.getAttribute('iWidget')){
				this.isDragging = true;
				this.target = target;
			}
			this.isActionOut(target);
		},
		dragMove: function(e){
			if(!this.isDragging){
				return ;
			}
			this.initDragEvent(e);		
			var that = this;
			var pagex = e.touches[0].pageX;
			var pagey = e.touches[0].pageY;
			this.caculate();
			var iconHeight = this.iconHeight;
			var iconWidth = this.iconWidth;
			if(that.isVertical){			
				if(pagey>iconHeight*3.5 && pagey<iconHeight*4){					
					clearTimeout(this.timeout);
					this.timeout = setTimeout(function(){
						if(that.currentPageIndex+1 < that.pagesCount){
							that.slideToPage(that.currentPageIndex+1, 100);
						}
					}, 1000);
				}else if(pagey<iconHeight*0.2){
					clearTimeout(this.timeout);
					this.timeout = setTimeout(function(){
						if(that.currentPageIndex-1 >= 0){
							that.slideToPage(that.currentPageIndex-1, 100);
						}
					}, 1000);
				}
				else if(pagey>=iconHeight*4){
					clearTimeout(this.timeout);
					this.timeout = setTimeout(function(){
						that.moveInTray();
					}, 1000);
				}
				else{
					clearTimeout(this.timeout);
				}
			}else{
				if(pagex>iconWidth*3.7){
					clearTimeout(this.timeout);
					this.timeout = setTimeout(function(){
						if(that.currentPageIndex+1 < that.pagesCount){
							that.slideToPage(that.currentPageIndex+1, 100);
						}
					}, 1000);
				}else if(pagex<iconWidth/3){
					clearTimeout(this.timeout);
					this.timeout = setTimeout(function(){
						if(that.currentPageIndex-1 >= 0){
							that.slideToPage(that.currentPageIndex-1, 100);
						}
					}, 1000);
				}else{
					clearTimeout(this.timeout);
				}
			}
			var row = Math.round(pagey/iconHeight); //25% height
			var column = Math.round(pagex/iconWidth+0.5); //25% width
			if(this.isVertical){
				if(this.actionOut){
					this.target.style.left = (pagex-iconWidth/2) + "px";
					this.target.style.top  = (pagey-iconHeight/2) - document.getElementById("appScreen").clientHeight+ "px";
				}else{
					this.target.style.left = (pagex-iconWidth/2)+ "px";
					this.target.style.top  = (pagey-iconHeight/2)+this.currentPageIndex*document.getElementById("appScreen").clientHeight + "px";
				}
			}else{
				this.target.style.left = (pagex-iconWidth/2)+ this.currentPageIndex*document.getElementById("appScreen").clientHeight +"px";
				this.target.style.top  = (pagey-iconHeight/2)+"px";
			}
			row = row||1;
			if(this.actionIn || row>4){
				this.to = false;
			}else{
				row += this.currentPageIndex*this.appsPerColumn;
				this.to = (row-1)*4+column;
			}
			this.highlight(iconWidth);
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
				this.endToIn();
			}else if(this.actionOut){
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
					if(this.pageIndexMem == this.currentPageIndex){
						if(this.isVertical){
							this.target.style.left = (des%this.appsPerRow)*(100/this.appsPerRow)+"%";
							this.target.style.top = Math.floor(des/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
							if(this.queue[des]){
								this.queue[des].style.left = ((from-1)%this.appsPerRow)*(100/this.appsPerRow)+"%";
								this.queue[des].style.top = Math.floor((from-1)/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";							
							}
						}
						else{
							this.target.style.left = (des%this.appsPerRow)*100/(this.pagesCount*this.appsPerRow)+"%";
							this.target.style.top = Math.floor(des/this.appsPerColumn)*(100/this.appsPerColumn)+"%";
							if(this.queue[des]){
								this.queue[des].style.left = ((from-1)%this.appsPerRow)*100/(this.pagesCount*this.appsPerRow)+"%";
								this.queue[des].style.top = Math.floor((from-1)/this.appsPerColumn)*(100/this.appsPerColumn)+"%";
							}
						}
						this.switchQueue(from, this.to);
					}else{
						if(this.queue[des]){
							this.target.style.left = ((from-1)%this.appsPerRow)*(100/this.appsPerRow)+"%";
							this.target.style.top = Math.floor((from-1)/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
						}else{
							this.target.style.left = (des%this.appsPerRow)*(100/this.appsPerRow)+"%";
							this.target.style.top = Math.floor(des/this.appsPerColumn)*100/(this.pagesCount*this.appsPerColumn)+"%";
							this.moveQueue(from, this.to);
						}
					}
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
			var tmp = this.queue[to-1];
			this.queue[to-1] = this.queue[from-1];			
			this.queue[from-1] = tmp;	
		},
		moveQueue: function(from, to){
			this.queue[to-1] = this.queue[from-1];
			this.queue[from-1] = undefined;			
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
				if(this.pageIndexMem == this.currentPageIndex && (!this.actionOut)){
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
		caculate: function(){
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
	
	//add an public API, which can be used as addEventListener.
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
		//remember the configuration of all the widgets.
		logWidget: function(wgt){
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
		//add some listeners on the widget.
		initWidget: function(key,obj){
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
			var that = this;
			//Hide the app icon, after open its widget
			openNode.addEventListener("dbclick", function(e){
				for(var j=0; j<that.queue.length; j++){
					if(that.queue[j] && that.queue[j].id === key){
						that.elPos = j+1;
					}
				}
				try{
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
	//add a API debug, for logging info
	var debug = base.debug = base.fn.extend({
		// debug is working for debug the program. Note: don't log large object in deepth like window/document, may exceed the stack size, and get error.
		debug: function(){
			var str="";
			for(var i=0; i<arguments.length; i++){
				if(typeof arguments[i] == "object"){
					for(var j in arguments[i]){
						if(typeof arguments[i][j] == "object"){
							str += " {";
							str += j;
							str += ":";
							str += debug(arguments[i][j]);
							str += "}, ";
						}
						else{
							str += " {";
							str += j;
							str += ":";
							str += arguments[i][j];	
							str += "}, ";
						}
					}
				}else{
					str += " ";
					str += arguments[i];				
				}
			}
			console.log(str);
			return str;
		}
	})[0];
	
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
			div.style.position = "fixed";
			div.style.bottom = "0";
			div.style.left = "0";
			div.style.backgroundColor = "black";
			div.style.opacity = "0.6";
			div.style.borderTop = "1px solid #F0FFF0"
			div.id = "tray";
			this.tray = div;
			document.body.appendChild(div);		
		},
		moveInTray: function(){			
			if(!this.checkFull()){
				var target = this.target.cloneNode(true);
				this.tray.appendChild(target);				
				this.actionIn = true;			
				this.targetMem = target;
				this.arrange();
			}
		},
		endToIn: function(){
			this.delQueue(this.from);
			this.container.removeChild(this.target);
			this.target = this.targetMem;
			this.actionIn = false;
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
			for(var i=0; i<icons.length; i++){
				icons[i].style.webkitAnimation = "";
				icons[i].style.top = "0";
				icons[i].style.height = "100%";
				icons[i].style.width = 100/icons.length + "%";
				icons[i].style.left = 100/icons.length*i + "%";
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
			if(target.parentNode.id == "tray"){
				this.actionOut = true;
			}
			else{
				this.actionOut = false;
			}
		},
		restoreEvent: function(){
			var widget = this.widgets[this.target.id];
			if(widget){
				document.getElementById(widget.open.node).addEventListener("dbclick", widget.open.func, false);
				document.getElementById(widget.close.node).addEventListener("dbclick", widget.close.func, false);
				widget.widget.style.top = this.target.style.top;
				widget.widget.style.left = this.target.style.left;
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