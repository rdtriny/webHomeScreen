!function(base){	
	base.Page = base.extend(base.Page, {
		pagesCount: 0,
		
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
			this.refresh();
		},		
		// move background image.
		moveBG : function(isMovable, coor){
			if(isMovable && typeof coor.y == 'number'){
				document.body.style.backgroundPosition = "0 " + (coor.y*100/document.getElementById("iconsContainer").clientHeight)+"%";
			}
		}
	});
}(_Base_);