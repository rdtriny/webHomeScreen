var Base = (function(window, undefined){
	var base = function(container, config){
		if(typeof container == "string"){
			this.container = document.getElementById(container);
		}
		else if(typeof container == "object" && container.nodeType == 1){
			this.container = container;
		}
		if(config && typeof config == "object"){
			for(var i in config){
				this[i] = config[i];
			}
		}
		var that = this;
		this.container.addEventListener("touchstart", function(e){
			that.touchstart(e);
		}, false);
		this.container.addEventListener("touchmove", function(e){
			that.touchmove(e);
		}, false);
		this.container.addEventListener("touchend", function(e){
			that.touchend(e);
		}, false);
		this.container.addEventListener("touchcancel", function(e){
			that.touchcancel(e);
		}, false);
		this.container.addEventListener("click", function(e){
			that.click(e);
		}, false);
		if(this.dragable){
			this.drag();
		}
		this.isWidgetShow = false;
	};
	base.prototype = {
		appStyle: null,
		startX: 0,
		startY: 0,
		longTapIndex: null,
		longtapStart: false,
		longtapTime: 0,
		dbclickInterval: null,
		lastClickTime: 0,
		appsPerRow: 4,
		appsPerColumn: 5,
		appsCount: 0,
		pagesCount: 0,
		currentPageIndex: 0,
		movedDistance: 0,
		moveStartX: 0,
		moveStartY: 0,
		endX: 0,
		endY: 0,
		isVertical: false,
		touchstart: function(e){
			this.startX = e.touches[0].pageX;
			this.startY = e.touches[0].pageY;
			
			this.longtapTime = new Date;
			var that = this;
			this.longTapIndex = setTimeout(function(){
				e.stopPropagation();
				var event = document.createEvent("Events");
				event.initEvent("longtap", true, true);
				e.target.dispatchEvent(event);
				that.longtapStart = true;
			}, 1000);
		},
		touchmove: function(e){
			if((new Date)-this.longtapTime < 1000){
				clearTimeout(this.longTapIndex);
				var pagex = this.endX = e.touches[0].pageX;
				var pagey = this.endY = e.touches[0].pageY;
				if(this.isVertical){
					var y = this.startY-pagey + this.moveStartY;
					var dis = {x:0, y:y};
					this.movedDistance = pagey-this.startY;
				}
				else{
					var x = pagex-this.startX + this.moveStartX;
					var dis = {x:x, y:0};
					this.movedDistance = pagex-this.startX;					
				}
				if(!this.isWidgetShow)
					this.css3move(this.container, dis, 200);
			}
		},
		touchend: function(e){
			if((new Date)-this.longtapTime < 1000){
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
					var swipe = document.createEvent("Events");
					swipe.initEvent("swipe", true, true);
					swipe.data = {};
					swipe.data.direction = direction;
					e.target.dispatchEvent(swipe);
					this.endX = 0;
				}
			}
			
			var now = new Date;
			if(now - this.lastClickTime<200){
				var event = document.createEvent("Events");
				event.initEvent("dbclick", true, true);
				e.target.dispatchEvent(event);
			}
			this.lastClickTime = now;
			
			if(this.isVertical){
				var pageHeight = document.getElementById("appScreen").clientHeight;
				var percent = this.movedDistance / pageHeight;
				if(Math.abs(percent) > 0.06  && !this.isWidgetShow){
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
				else {
					y = this.currentPageIndex*pageHeight;
				}			
				this.moveStartY = y;
				this.css3move(this.container, {x:0, y:y}, 200);	
			}
			else{
				var pageWidth = document.getElementById("appScreen").clientWidth;
				percent = this.movedDistance / pageWidth;				
				if(Math.abs(percent) > 0.06  && !this.isWidgetShow){
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
				this.css3move(this.container, {x:x, y:0}, 200);	
			}		
			this.longtapStart = false;
		},
		touchcancel: function(e){
			this.touchend(e);
		},
		click: function(e){
			var target = e.target;
			while(!target.id && target.id!="iconsContainer"){
				target = target.parentNode;
			}
			if(/[A-z0-9]+\./ig.test(target.id)){
				this.elPos = target.getAttribute("elPos");
				console.log(target.id);
				//location.href = target.id;
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
		//register application to the system.
		register: function(app){
			this.appsCount ++;
			if(this.appsCount%(this.appsPerRow*this.appsPerColumn)==1){
				this.managePages(1);
			}
			var appNode = this.createAppNode(app);
			this.display(appNode);
			if(app.widget){
				this.addWidget(app.widget ,appNode);
				appNode.setAttribute("isWidget", "true");
			}
		},
		//change the location of apps
		drag: function(){
			var that = this;
			var to;
			this.container.addEventListener("longtap", function(e){
				var target = e.target;
				while(!target.id && target.id!="iconsContainer"){
					target = target.parentNode;
				}
				if(/[A-z0-9]+\./ig.test(target.id)){
					target.style.webkitTransform = "scale(1.3)";
					that.container.ontouchmove = function(e){
						var pagex = e.touches[0].pageX;
						var pagey = e.touches[0].pageY;
						var icon = document.getElementsByClassName("icon")[0];
						var iconHeight = icon.clientHeight;
						var iconWidth = icon.clientWidth;
						
						var row = Math.round(pagey/iconHeight); //20% height
						var column = Math.round(pagex/iconWidth); //25% width
						target.style.left= (pagex-that.startX) + "px";
						target.style.top = (pagey-that.startY) + "px";
						row = row||1;
						to = (row-1)*4+column;
						that.switchNode(target, to);
					};
					that.container.ontouchend = function(e){
						var icon = document.getElementsByClassName("icon");
						target.style.webkitTransform = "";						
						that.container.ontouchmove = null;
						that.container.ontouchend = null;
						var tmpNode = target.cloneNode(true);
						tmpNode.onclick = target.onclick;
						if(target.id != icon[icon.length-1].id || to!=icon.length){
							document.getElementsByClassName("page")[that.currentPageIndex].removeChild(target);
							document.getElementsByClassName("page")[that.currentPageIndex].insertBefore(tmpNode, icon[to-1]);
						}
						for(var i=0; i<icon.length; i++){
							icon[i].style.left="";
							icon[i].style.top ="";
							icon[i].setAttribute("elPos", i+1);
						}
					}
				}
			}, false);
		},
		switchNode: function(node, to){
			var icon = document.getElementsByClassName("icon");
			var from;
			var len = icon.length;
			if(to>len)
				to = len;
			for(var i=0; i<len; i++){
				if(node.id == icon[i].id){
					from = i+1;
				}else{					
					icon[i].style.left = "";
					icon[i].style.top = "";
				}
			}
			if(from < to){
				for(var i=from; i<to; i++){
					if(icon[i]){
						if(i%4==0){
							icon[i].style.left="75%";
							icon[i].style.top ="-20%";
						}else{
							icon[i].style.left="-25%";
						}
					}
				}
			}else{
				for(var i=to-1; i<from-1; i++){
					if(icon[i]){
						if(i%4==3){
							icon[i].style.left="-75%";
							icon[i].style.top ="20%";
						}else{
							icon[i].style.left="25%";
						}
					}
				}
			}
		},
		//switch the pages left or right.
		slideToPage: function(pageIndex, time){
			var pageWidth = document.getElementById("appScreen").clientWidth;
			var x = pageIndex*pageWidth*-1;
			this.css3move(this.container, {x:x, y:0}, time);
		},
		css3move: function(el, distance, time){
			time = time || 0;
			el.style.webkitTransform = 'translate3d('+ distance.x +'px, -' + distance.y + 'px,0)';
			el.style.webkitTransitionDuration = time + 'ms';
			el.style.webkitBackfaceVisiblity = 'hidden';
			el.style.webkitTransformStyle = 'preserve-3d';
			el.style.webkitTransitionTimingFunction = 'cubic-bezier(0.33,0.66,0.66,1)';
			
			console.log(distance.y);
		},
		//manage the pages which is hosting app icons. inc for increment
		managePages: function(inc){
			var pages = document.getElementsByClassName("page");
			this.pagesCount += inc;			
			if(inc>0){
				for(var i=0; i<inc; i++){
					var page = document.createElement("div");
					page.className = "page";
					this.container.appendChild(page);
				}
			}
			else{
				for(var i=0; i<(-inc); i++){
					this.container.removeChild(pages[this.pagesCount+i]);
				}
			}
			if(this.isVertical){
				this.container.style.height = 100*this.pagesCount+"%";			
				for(var j=0; j<this.pagesCount; j++){
					pages[j].style.height = (100/this.pagesCount)+"%";
					pages[j].style.clear = "both";
				}
			}
			else{
				this.container.style.width = 100*this.pagesCount+"%";			
				for(var j=0; j<this.pagesCount; j++){
					pages[j].style.width = (100/this.pagesCount)+"%";
				}
			}
		},
		//display all the app icons to the screen.
		display: function(appNode){
			document.getElementsByClassName("page")[this.pagesCount-1].appendChild(appNode);
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
		addWidget: function(widget, el){
			var wdt = document.createElement("script");
			wdt.src = widget;
			wdt.type= "text/javascript";
			document.head.appendChild(wdt);
			window.el = el;
			window.pageIndex = this.pagesCount;
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
		yield: function(direction, blockNum){
			var elPos = this.elPos;
			elPos -= 1;
			var icons = document.getElementsByClassName("icon");
			if(direction == "down"){
				for(var i=1; i<blockNum; i++){
						if(icons[elPos+i])
							icons[elPos+i].style.top = (this.toNum(icons[elPos+i].style.top)+20)+"%";
				}
				while(icons[elPos]){
					for(var i=0; i<blockNum; i++){
						if(icons[elPos+4+i]){
							icons[elPos+4+i].style.top = (this.toNum(icons[elPos+4+i].style.top)+20)+"%";
						}
					}
					elPos += 4;
				}
			}
			else if(direction == "right"){
				while(icons[elPos]){
					for(var i=1; i<blockNum; i++){
						if(icons[elPos+i])
							icons[elPos+i].style.top = (this.toNum(icons[elPos+i].style.top)+20)+"%";
					}
					elPos += 4;
				}
			}
			else if(direction == "left"){
				while(icons[elPos]){
					for(var i=blockNum-1; i>0; i--){
						if(icons[elPos-i])
							icons[elPos-i].style.top = (this.toNum(icons[elPos-i].style.top)+20)+"%";
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
			var icons = document.getElementsByClassName("icon");
			if(direction == "up"){
				for(var i=1; i<blockNum; i++){
						if(icons[elPos+i])
							icons[elPos+i].style.top = (this.toNum(icons[elPos+i].style.top)-20)+"%";
				}
				while(icons[elPos]){
					for(var i=0; i<blockNum; i++){
						if(icons[elPos+4+i]){
							icons[elPos+4+i].style.top = (this.toNum(icons[elPos+4+i].style.top)-20)+"%";
						}
					}
					elPos += 4;
				}
			}
			else if(direction == "left"){
				while(icons[elPos]){
					for(var i=1; i<blockNum; i++){
						if(icons[elPos+i])
							icons[elPos+i].style.top = (this.toNum(icons[elPos+i].style.top)-20)+"%";
					}
					elPos += 4;
				}
			}
			else if(direction == "right"){
				while(icons[elPos]){
					for(var i=blockNum-1; i>0; i--){
						if(icons[elPos-i])
							icons[elPos-i].style.top = (this.toNum(icons[elPos-i].style.top)-20)+"%";
					}
					elPos += 4;
				}
			}
		},
		
	};
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


//for test.
setTimeout(function(){
window.system = new Base("iconsContainer",{dragable:true, isVertical:true});
system.register({title:"weather",packageName:"com.orange.weather",imgSrc:"./images/weather.png",widget:"./widget/weather.js"})
system.register({title:"music",packageName:"com.orange.music",imgSrc:"./images/music.png",widget:""})
system.register({title:"facebook",packageName:"com.orange.facebook",imgSrc:"./images/facebook.png",widget:""})
system.register({title:"movie",packageName:"com.orange.movie",imgSrc:"./images/movie.png",widget:""})
system.register({title:"twitter",packageName:"com.orange.twitter",imgSrc:"./images/twitter.png",widget:""})
system.register({title:"rss",packageName:"com.orange.rss",imgSrc:"./images/rss.png",widget:""})
system.register({title:"alarm",packageName:"com.orange.alarm",imgSrc:"./images/alarm.png",widget:""})
system.register({title:"tv",packageName:"com.orange.tv",imgSrc:"./images/tv.png",widget:""})
system.register({title:"message",packageName:"com.orange.message",imgSrc:"./images/message.png",widget:""})
}, 2000);

window.addEventListener("gestureend", function(){
	console.log("getsteure");
}, false);

window.addEventListener("swipe", function(e){
	console.log(e.data.direction);
}, false);