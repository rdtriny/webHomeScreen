!function(base){	
	//
	// create slidebar, slide it when the page scroll up/down.
	//
	base.Sidebar = base.extend(base.Sidebar, {
		
		// a nodeElement, a sidebar
		sidebar: null,
		
		sideBar: function(isShow){
			if(!base.Sidebar.sidebar && isShow){
				var sidebar = document.createElement("div");
				sidebar.style.position = "absolute";
				var appScreen = document.getElementById("appScreen");
				if(base.Config.isVertical){
					sidebar.style.right = "1px";
					sidebar.style.width = "4px";
					sidebar.style.height = (appScreen.clientHeight/base.Page.pagesCount)+"px";
					
				}else{
					sidebar.style.bottom = "1px";
					sidebar.style.height = "4px";
					sidebar.style.width = (appScreen.clientWidth/base.Page.pagesCount)+"px";
				}
				sidebar.style.backgroundColor = "black";
				sidebar.style.opacity = "0.4";
				sidebar.style.borderRadius = "3px";
				sidebar.style.zIndex = "99";
				appScreen.appendChild(sidebar);
				base.Sidebar.sidebar = sidebar;
			}else if(base.Sidebar.sidebar && isShow){
				base.Sidebar.sidebar.style.display = "block";
			}else{
				setTimeout(function(){
					base.Sidebar.sidebar.style.display = "none";
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
	
	_Base_ = base;
}(_Base_);