!function(base){	
	base.Page = base.extend(base.Page, {
		pagesCount: 0,
		currentRowIndex: 0,
		//switch the pages up/down.
		slideToPage: function(inc, time){
			var appsPerColumn = base.Config.appsPerColumn,
				pagesCount = base.Page.pagesCount,
				currentRowIndex = base.Page.currentRowIndex;				
				
			var rows = inc * appsPerColumn;			
			currentRowIndex += rows;
			// the total num of rows
			var max = (pagesCount-1) * appsPerColumn;
			// make sure rowindex < totalnum and rowindex >0
			if(currentRowIndex < 0)
				currentRowIndex  = 0;
			else if(currentRowIndex>max)
				currentRowIndex = max;
				
			if(base.Config.isVertical){
				var y = currentRowIndex*base.App.iconHeight;
				base.Page.css3move(base.container, {x:0, y:y}, time);
				base.Drive.Var.moveStartY = y;
				
				base.Page.currentRowIndex = currentRowIndex;
			}
			base.Page.moveBG(base.Config.isBGMovable, {x:0,y:y});
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
			amount = amount || 1;
			base.Page.pagesCount += amount;
			base.Page.pagesCount = base.Page.pagesCount || 1;
			base.System.refresh();
			base.Sidebar.resizeSidebar(base.Page.pagesCount);
		},		
		// move background image.
		moveBG : function(isMovable, coor){
			if(isMovable && typeof coor.y == 'number'){
				document.body.style.backgroundPosition = "0 " + (coor.y*100/document.getElementById("iconsContainer").clientHeight)+"%";
			}
		}
	});
	
	_Base_ = base;
}(_Base_);