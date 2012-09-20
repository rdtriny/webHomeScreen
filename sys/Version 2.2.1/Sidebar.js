!function(base){	
	//
	// create slidebar, slide it when the page scroll up/down.
	//
	base.Sidebar = base.extend(base.Sidebar, {
		
		// a nodeElement, a sidebar
		sidebar: null,
		
		sideBar: function(isShow){
			if(!this.sidebar && isShow){
				var sidebar = document.createElement("div");
				sidebar.style.position = "absolute";
				var appScreen = document.getElementById("appScreen");
				if(this.isVertical){
					sidebar.style.right = "1px";
					sidebar.style.width = "4px";
					sidebar.style.height = (appScreen.clientHeight/this.pagesCount)+"px";
					
				}else{
					sidebar.style.bottom = "1px";
					sidebar.style.height = "4px";
					sidebar.style.width = (appScreen.clientWidth/this.pagesCount)+"px";
				}
				sidebar.style.backgroundColor = "black";
				sidebar.style.opacity = "0.4";
				sidebar.style.borderRadius = "3px";
				sidebar.style.zIndex = "99";
				appScreen.appendChild(sidebar);
				this.sidebar = sidebar;
			}else if(this.sidebar && isShow){
				this.sidebar.style.display = "block";
			}else{
				var that = this;
				setTimeout(function(){
					that.sidebar.style.display = "none";
				},1000);
			}
		},
		//change sidebar's position.
		moveSidebar : function(sidebar, coor){
			if(sidebar && typeof coor.y == "number"){
				var top = coor.y;
				var containerH = document.getElementById("iconsContainer").clientHeight;
				sidebar.style.top = 100*top/containerH + "%";
			}
		}
	});
}(_Base_);