!function(name, id){
	var widgetDiv = document.createElement("div");
	widgetDiv.style.position = "absolute";
	widgetDiv.id = name;
	// set a self defined arrtibute 'iWidget', to record which application it belongs to.
	widgetDiv.setAttribute("iWidget", id);
	widgetDiv.style.zIndex = "30";
	widgetDiv.style.margin = "1% 0 0 2.5%";
	widgetDiv.style.width = "45%";
	widgetDiv.style.display = "none";
	
	var widgetImg = document.createElement("img");
	widgetImg.src = "./images/clock.jpg";
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
		"com.orange.clock/clock":{
			widget:name,
			open: {
				node: id,
				func: open
			},
			close: {
				node: name,
				func: close
			},
			size: {
				width: 2,
				height: 2
			}
		}
	});
}("clock","com.orange.clock/clock");