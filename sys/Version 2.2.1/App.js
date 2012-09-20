!function(base){	
	base.App = base.extend(base.App, {
		Var: {
			// a function which defines the structure of application's div.
			appStyle: null,
			// height,width of the application div.
			iconWidth: 0,
			iconHeight: 0,
		},
		//find the app area's height and width
		getSize: function(){
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
		},
		//register application to the system.
		register: function(app){
			this.appsCount ++;
			var appNode = this.createAppNode(app);
			if(app.widget){
				base.require(app.widget);
				appNode.setAttribute("isWidget", "true");
			}
			this.queue.push(appNode);
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
		//update the appearence of the app, change appStyle(a function)
		updateAppStyle: function(func){
			if(func && typeof func =="function"){
				this.appStyle = func;
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
					this.yield.block22.apply(this, arguments);
				}
				else if(widgetSize.width == 4 && widgetSize.height == 1){
					this.yield.block14.apply(this, arguments);
				}else if(widgetSize.width == 3 && widgetSize.height == 1){
					this.yield.block13.apply(this, arguments);
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
		},	
		/*
			push the applications which block widget's space downward.
			according to the widget's width, make a tiny loop each line
			according to the widget's height, calculate the vertical distance to move.
			from back to forth
		*/
		// a function of an object was called , the object was passed to the function as 'this', if the object can't be identified, window was passed just as the following function.
		down : function (that, icons, elPos, widgetSize){
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
		},
		block14 : function(){
			
		},
		block13 : function(){
		
		}	
	});
	
	// action definition when drag event fires.
	base.App.Drag = base.extend(base.App.Drag, {
		Var: {
			// the nth number when drag start.
			from: false,
			// the nth number when drag move.
			to: false,			
			isDragging: false
		},
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
				this.bubbleDragEvent(e);	
			}else if(target.getAttribute('iWidget')){
				this.isDragging = true;
				this.target = target;
				// fires an drag event.
				this.bubbleDragEvent(e);	
			}
			
			for(var j=0; j<this.queue.length; j++){
				if(this.queue[j]&&(this.queue[j].id === this.target.id || this.queue[j].id === this.target.getAttribute("iWidget")))
					this.from = j+1;
			}			
			// if the app moves out of favorite tray, or moves into the favorite , or just in iconContainer.
			base.Tray.isActionOut(target);
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
				if(base.Tray.Var.actionOut){
					this.target.style.left = (pagex-iconWidth/2) + "px";
					this.target.style.top  = (pagey-iconHeight/2) - iconHeight*this.appsPerColumn+ "px";
				}else{
					this.target.style.left = (pagex-iconWidth/2)+ "px";
					this.target.style.top  = (pagey-iconHeight/2)+this.currentRowIndex*iconHeight + "px";
					if(base.Tray.Var.targetMem){
						base.Tray.Var.targetMem.style.left = (pagex-iconWidth/2) + "px";
						base.Tray.Var.targetMem.style.top  = (pagey-iconHeight/2) - iconHeight*this.appsPerColumn+ "px";
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
						base.Tray.moveInTray.call(that);
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
			if(base.Tray.Var.actionIn){
				base.Tray.endToIn.call(this, this.endY);
			}
			else if(base.Tray.Var.actionOut){
				if(!this.queue[this.to-1]){
					base.Tray.moveOutTray.call(this);
				}				
				base.Tray.endToOut.call( this, (!!this.queue[this.to-1]) );
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
		exchangeOnMove: function(pagey){
			clearTimeout(this.timeout2);
			this.timeout2 = setTimeout(function(){
				if(!base.Tray.Var.actionOut && this.rowIndexMem == this.currentRowIndex && pagey<this.iconHeight*4){
					this.switchQueue(this.from, this.to);
					this.from = this.to;
				}
			}.bind(this), 300);
		},
		bubbleDragEvent: function(e){
			var event = document.createEvent("Events");
			event.initEvent("drag", true, true);
			e.target.dispatchEvent(event);
		},	
	});
}(_Base_);