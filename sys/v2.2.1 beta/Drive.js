!function(base){
	
	base.Drive = base.Drive || {};
	base.Drive.Var = base.Drive.Var || {};
	
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
			base.Sidebar.sideBar(true);
			// calculate the app's height and width, once for all.
			base.App.getSize();
			base.Drive.Var.pinchEndLen = 0;
			base.Drive.Var.longtapStart = false;
			if(e.touches.length === 1){
				base.Drive.Var.startX = e.touches[0].pageX;
				base.Drive.Var.startY = e.touches[0].pageY;
				
				//if you touch one point for 1 seconds, longtap fires.
				base.Drive.Var.longTapIndex = setTimeout(function(){
					var event = document.createEvent("Events");
					event.initEvent("longtap", true, true);
					e.target.dispatchEvent(event);
					base.Drive.Var.longtapStart = true;
					base.App.Drag.dragStart(e);							
					base.Sidebar.sideBar(false);
				}, 1000);
			}
			else if(e.touches.length === 2){
				//this line is very very important, 'cause when two point gestures fire, the length will be 1,2,1 in order. prevent Drag event.
				clearTimeout(base.Drive.Var.longTapIndex);
				var lenX = e.touches[1].pageX-e.touches[0].pageX;
				var lenY = e.touches[1].pageY-e.touches[0].pageY;
				base.Drive.Var.pinchStartLen = Math.sqrt(lenX*lenX+lenY*lenY);
			}
		},
		touchmove: function(e){
			var Var = base.Drive.Var;
			e.preventDefault();
			Var.lastMoveTime = new Date;					
			clearTimeout(Var.longTapIndex);
			// if longtap fires just now, dragMove() will run. if not, slide will run.
			if(!Var.longtapStart){
				if(e.touches.length == 1){
					Var.nextToEndX = Var.endX;
					Var.nextToEndY = Var.endY;
					var pagex = Var.endX = e.touches[0].pageX;
					var pagey = Var.endY = e.touches[0].pageY;					
					if(base.Config.isVertical){
						var y = Var.startY-pagey + Var.moveStartY;
						var maxHeight = document.getElementById("appScreen").clientHeight*(base.Page.pagesCount-1);
						if(y> maxHeight){
							y = maxHeight;
						}else if(y<0){
							y=0;
						}
						var des = {x:0, y:y};
						Var.movedDistance = pagey-Var.startY;
					}
					else{
						var x = pagex-Var.startX + Var.moveStartX;					
						var maxWidth = document.getElementById("appScreen").clientWidth*(base.Page.pagesCount-1)*-1;
						if(x>0)
							x=0;
						else if(x < maxWidth)
							x=maxWidth;
						des = {x:x, y:0};
						Var.movedDistance = pagex-Var.startX;
					}
					base.Sidebar.moveSidebar(base.Sidebar.sidebar, des);
					base.Page.moveBG(base.Config.isBGMovable, des);
					base.Page.css3move(base.container, des);
				}
				else if(e.touches.length == 2){
					if(!Var.pinchEndLen){
						Var.pinchEndLen = Math.sqrt((e.touches[1].pageX-e.touches[0].pageX)*(e.touches[1].pageX-e.touches[0].pageX)+(e.touches[1].pageY-e.touches[0].pageY)*(e.touches[1].pageY-e.touches[0].pageY));
						var pinchEvent = document.createEvent("Events");
						pinchEvent.initEvent("pinch", true, true);
						pinchEvent.scale = Var.pinchEndLen/Var.pinchStartLen;
						e.target.dispatchEvent(pinchEvent);
					}
				}
			}else{
				base.App.Drag.dragMove(e);
			}
		},
		touchend: function(e){
			var Var = base.Drive.Var,
				currentRowIndex = base.Page.currentRowIndex;
			
			if(Var.longtapStart){
				base.App.Drag.dragEnd(e);				
			}else{
				clearTimeout(Var.longTapIndex);
				var w = Var.endX-Var.nextToEndX;
				var h = Var.endY-Var.nextToEndY;
				var time = (new Date - Var.lastMoveTime);
				var lastMoveSpeed = Math.sqrt(w*w + h*h)/time;				
				// when your finger has moved on the screen, swipe event will bubble up.
				if(Var.endX){
					if(Math.abs(Var.endX-Var.startX) > Math.abs(Var.endY-Var.startY)){
						if(Var.endX > Var.startX){
							var direction = "right";
						}else{
							direction = "left";
						}
					}else{
						if(Var.endY > Var.startY){
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
					Var.endX = 0;
				}
				
				if(base.Config.isVertical){
					var percent = Var.movedDistance / (base.App.iconHeight*base.Config.appsPerColumn);				
					// max height to iconContainer's top border
					var max = (base.Page.pagesCount-1)*base.Config.appsPerColumn;
					// swipe in high speed, slide to next page.
					if(lastMoveSpeed>0.3){
						if(percent>0){
							currentRowIndex -= base.Config.appsPerColumn;
							// make sure rowindex > 0
							currentRowIndex = currentRowIndex>0 ? currentRowIndex : 0;
						}
						else if(percent<0){
							currentRowIndex += base.Config.appsPerColumn;
							// make sure rowindex < totalnum
							currentRowIndex = currentRowIndex < max ? currentRowIndex : max;
						}
					// low speed slide row to row.
					}else{
						var movedRow = Math.round(percent*base.Config.appsPerColumn);
						// note that movedRow is negative when slide up, positive when slide down.
						currentRowIndex -= movedRow;
						// make sure rowindex > 0 && rowIndex < max
						if(currentRowIndex < 0)
							currentRowIndex  = 0;
						else if(currentRowIndex>max)
							currentRowIndex = max;					
						
					}
					var y = currentRowIndex*base.App.iconHeight;
					Var.moveStartY = y;
					base.Page.currentRowIndex = currentRowIndex;
					var des = {x:0, y:y};
				}
				base.Sidebar.moveSidebar(base.Sidebar.sidebar, des);
				base.Page.css3move(base.container, des, 100);
				base.Page.moveBG(base.Config.isBGMovable, des);
				base.Sidebar.sideBar(false);
				Var.movedDistance = 0;
			}			
		},
		// sometimes touchcancel when you move out of the screen.
		touchcancel: function(e){
			base.Drive.touchend(e);
		},
		click: function(e){
			var Var = base.Drive.Var;
			var now = new Date;			
			var target = e.target;
			// two clicks within 400ms, double click fires, or two click event fires.
			if(now - Var.lastClickTime<400){
				clearTimeout(Var.clickIndex);
				var event = document.createEvent("Events");
				event.initEvent("dbclick", true, true);
				e.target.dispatchEvent(event);
			}else{
				Var.clickIndex = setTimeout(function(){
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
			Var.lastClickTime = now;
		}
	});
	
	_Base_ = base;
}(_Base_);