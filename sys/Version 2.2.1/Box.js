!function(base){	
	//
	//	use to indicate where can put the app, when dragging an app and want to put it down.
	//
	
	base.Box = base.extend(base.Box, {		
		highlightBox: null,
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
				if(base.Tray.Var.actionOut || this.rowIndexMem != this.currentRowIndex){
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
		}
	});
}(_Base_);