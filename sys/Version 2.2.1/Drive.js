!function(base){	
	base.Drive = base.extend(base.Drive, {
		Var: {
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
			lastMoveTime: undefined
		},
		touchstart: function(e){
			// display the sidebar.
			this.sideBar(true);
			// calculate the app's height and width, once for all.
			this.getSize();
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
		}
	});
}(_Base_);