!function(base){	
	//
	//	use to indicate where can put the app, when dragging an app and want to put it down.
	//
	
	base.Box = base.extend(base.Box, {		
		highlightBox: null,
		//show whether the app can be dragged to the target location. red for no, green for yes.
		highlight: function(sideLen){
			var des = base.App.to - 1, i;
			if(!base.Box.highlightBox){
				var div = document.createElement("div");
				div.style.height = sideLen*0.66 + "px";
				div.style.width = sideLen*0.66 + "px";
				div.style.marginTop = sideLen/4 +"px";
				div.style.marginLeft = sideLen/6 +"px";
				div.style.position = "absolute";
				div.style.display = "none";
				base.container.appendChild(div);
				base.Box.highlightBox = div;
			}else if(sideLen !== false){
				base.Box.highlightBox.style.display = "block";				
				base.Box.highlightBox.style.left = (des%base.Config.appsPerRow)*(100/base.Config.appsPerRow)+"%";
				base.Box.highlightBox.style.top = Math.floor(des/base.Config.appsPerColumn)*100/(base.Page.pagesCount*base.Config.appsPerColumn)+"%";
				if(base.Tray.Var.actionOut || base.Page.rowIndexMem != base.Page.currentRowIndex){
					if(base.Queue.queue[des]){
						base.Box.highlightBox.style.webkitBoxShadow = "0 0 5px 2px red";
					}else{
						base.Box.highlightBox.style.webkitBoxShadow = "0 0 5px 2px green";
					}
				}else{
					base.Box.highlightBox.style.webkitBoxShadow = "0 0 5px 2px green";
				}
			}else{
				base.Box.highlightBox.style.display = "none";
				return "closed";
			}
		}
	});
	
	_Base_ = base;
}(_Base_);