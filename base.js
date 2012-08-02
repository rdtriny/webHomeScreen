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
		this.container.addEventListener("click", function(e){
			that.click(e);
		}, false);
		if(this.dragable){
			this.drag();
		}
	};
	base.prototype = {
		appStyle: null,
		startX: 0,
		startY: 0,
		longTapInterval: null,
		longtapStart: false,
		longtapTime: 0,
		dbclickInterval: null,
		lastClickTime: 0,
		appsPerRow: 4,
		appsPerColumn: 1,
		appsCount: 0,
		pagesCount: 0,
		currentPageIndex: 0,
		movedDistance: 0,
		moveStartX:0,
		touchstart: function(e){
			this.startX = e.touches[0].pageX;
			this.startY = e.touches[0].pageY;
			
			this.longtapTime = new Date;
			var that = this;
			this.longTapInterval = setTimeout(function(){
				var event = document.createEvent("Events");
				event.initEvent("longtap", true, true);
				e.target.dispatchEvent(event);
				that.longtapStart = true;
			}, 1000);
		},
		touchmove: function(e){
			if(!this.longtapStart){
				clearTimeout(this.longTapInterval);	
				var pagex = e.touches[0].pageX;
				var pagey = e.touches[0].pageY;
				var x = pagex-this.startX + this.moveStartX;
				var dis = {x:x, y:0};
				this.css3move(this.container, dis, 200);
				this.movedDistance = pagex-this.startX;
			}
		},
		touchend: function(e){
			this.longtapStart = false;
			if(this.longtapTime - new Date < 1000){
				clearTimeout(this.longTapInterval);
			}
			var now = new Date;
			if(now - this.lastClickTime<200){
				var event = document.createEvent("Events");
				event.initEvent("dbclick", true, true);
				e.target.dispatchEvent(event);
			}
			this.lastClickTime = now;
			
			var pageWidth = document.getElementById("appScreen").clientWidth;
			var percent = this.movedDistance / pageWidth;
			console.log(percent);
			
			if(Math.abs(percent) > 0.06){
				if(percent>0 && this.currentPageIndex>0){
					var x = (this.currentPageIndex-1)*pageWidth*-1;
					this.currentPageIndex -= 1;
					console.log("right");
				}
				else if(percent<0 && this.currentPageIndex<this.pagesCount-1){
					x = (this.currentPageIndex+1)*pageWidth*-1;
					this.currentPageIndex += 1;
					console.log("left");
				}
				else {
					x = this.currentPageIndex*pageWidth*-1;
					console.log("no move");
				}
			}
			else {
				x = this.currentPageIndex*pageWidth*-1;
			}			
			this.moveStartX = x;
			this.css3move(this.container, {x:x, y:0}, 200);
		},
		click: function(e){
			var target = e.target;
			while(!target.id && target.id!="iconsContainer"){
				target = target.parentNode;
			}
			if(/[A-z0-9]+\./ig.test(target.id)){
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
						var startRow = Math.round(that.pageY/iconHeight);
						var startColumn = Math.round(that.pageX/iconWidth);
						target.style.left= (pagex-that.startX) + "px";
						target.style.top = (pagey-that.startY) + "px";
						if(row!=startRow || column!=startColumn){
							row = row||1;
							to = (row-1)*4+column;
							that.switchNode(target, (row-1)*4+column);
						}
					};
					that.container.ontouchend = function(e){
						var icon = document.getElementsByClassName("icon");
						target.style.webkitTransform = "";
						for(var i=0; i<icon.length; i++){
							icon[i].style.left="";
							icon[i].style.top ="";
						}
						that.container.ontouchmove = null;
						that.container.ontouchend = null;
						var tmpNode = target.cloneNode(true);
						console.log(document.getElementsByClassName("page").length);
						document.getElementsByClassName("page")[that.currentPageIndex].removeChild(target);
						document.getElementsByClassName("page")[that.currentPageIndex].insertBefore(tmpNode, icon[to-1]);
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
				}
			}
			if(from < to){
				for(var i=from; i<to; i++){
					if(i%4==1){
						icon[i].style.left="75%";
						icon[i].style.top ="-20%";
					}else{
						icon[i].style.left="-25%";
					}
				}
			}else{
				for(var i=to-1; i<from-1; i++){
					if(i%4==0){
						icon[i].style.left="-75%";
						icon[i].style.top ="20%";
					}else{
						icon[i].style.left="25%";
					}
				}
			}
		},
		//switch the pages left or right.
		slideToPage: function(){
		
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
			
			this.container.style.width = 100*this.pagesCount+"%";			
			for(var j=0; j<this.pagesCount; j++){
				pages[j].style.width = (100/this.pagesCount)+"%";
			}
			console.log("pageCount change to " + this.pagesCount);
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
		
		}
	};
	return base;
})(window);


//for test.
setTimeout(function(){
var a = new Base("iconsContainer",{dragable:true});
a.register({title:"cloud",packageName:"com.orange.cloud",imgSrc:"./ihome/music.png",widget:""})
a.register({title:"facebook",packageName:"com.orange.facebook",imgSrc:"./ihome/facebook.png",widget:""})
a.register({title:"facebook",packageName:"com.orange.movie",imgSrc:"./ihome/movie.png",widget:""})
a.register({title:"facebook",packageName:"com.orange.twitter",imgSrc:"./ihome/twitter.png",widget:""})
a.register({title:"cloud",packageName:"com.orange.rss",imgSrc:"./ihome/rss.png",widget:""})
a.register({title:"facebook",packageName:"com.orange.alarm",imgSrc:"./ihome/alarm.png",widget:""})
a.register({title:"facebook",packageName:"com.orange.tv",imgSrc:"./ihome/tv.png",widget:""})
a.register({title:"facebook",packageName:"com.orange.weather",imgSrc:"./ihome/weather.png",widget:""})
a.register({title:"facebook",packageName:"com.orange.message",imgSrc:"./ihome/message.png",widget:""})
}, 2000);
window.addEventListener("dbclick", function(e){
	console.log(e.target.id+"         dbclick");
}, false);
window.addEventListener("longtap", function(e){
	console.log(e.target.id+"         logntap");
	e.preventDefault();
}, false);