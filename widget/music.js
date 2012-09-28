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