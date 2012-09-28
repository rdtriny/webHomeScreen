!function(){
	var widgetDiv = document.createElement("div");
	widgetDiv.style.position = "absolute";
	widgetDiv.id = "music";
	// set a self defined arrtibute 'iWidget', to record which application it belongs to.
	widgetDiv.setAttribute("iWidget", "com.lge.music/com.lge.music.MusicBrowserActivity");
	widgetDiv.style.zIndex = "30";
	widgetDiv.style.margin = "1% 0 0 2.5%";
	widgetDiv.style.width = "45%";
	widgetDiv.style.display = "none";
	
	var widgetImg = document.createElement("img");
	widgetImg.src = "./images/music.jpg";
	widgetImg.style.width = "100%";
	widgetImg.style.height = "100%";
	// append the img to widgetDiv
	widgetDiv.appendChild(widgetImg);
	
	var narrowDiv = document.createElement("div");
	narrowDiv.style.height = "20px";
	narrowDiv.style.width = "20px";
	narrowDiv.style.position = "absolute";
	narrowDiv.style.display = "none";
	narrowDiv.style.marginTop = "4px";
	narrowDiv.style.marginLeft = "4px";
	narrowDiv.style.bottom = "0";
	narrowDiv.style.right = "0";
	narrowDiv.style.zIndex = "10";
	narrowDiv.style.background = "url(./images/narrow.jpg) top left no-repeat";
	narrowDiv.style.backgroundPosition = "right bottom";
	// append the img to widgetDiv
	widgetDiv.appendChild(narrowDiv);
	
	// append the widgetDiv to iconsContainer div.
	document.getElementById("iconsContainer").appendChild(widgetDiv);
	
	// function open, which widget must implement, to open the widget.
	function open(){
		
	}
	
	// function close, which widget must implement, to close the widget.
	function close(){
		
	}
	
	_Base_.Widget.registerWidget({
		"com.lge.music/com.lge.music.MusicBrowserActivity":{
			widget:"music",
			open: {
				node: "com.lge.music/com.lge.music.MusicBrowserActivity",
				func: open
			},
			close: {
				node: "music",
				func: close
			},
			size: {
				width: 2,
				height: 2
			}
		}
	});
}();