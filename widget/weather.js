(function(el){
	var comOrangeWeather = "<div id='flash' style='position:absolute;z-index:30;margin-top:-40px;display:none'><div id='info' style='width:60%;height:100%;float:left;text-align:left;padding-left:15px;padding-top:40px;font-family:Arial,Helvetica,sans-serif;color:rgb(255,253,255);opacity:0;-webkit-transform-origin:0px 40px;-webkit-transform:rotate(90deg)'><h3 style='line-height:0px;font-size:1em;font-weight:normal'>Beijing</h3><h2 style='line-height:0px;font-size:1.5em;position:relative;font-weight:normal'>Rain  28&deg;C</h2><p style='line-height:0px;font-size:0.8em;position:relative;top:-5px'>Wind: NW at 3 mph</p><p style='line-height:0px;font-size:0.8em;position:relative;top:-3px'>23&deg;C - 28&deg;C</p></div><div id='pic' style='width:40%;height:100%;position:absolute;text-align:left;right:-5px;top:55px;opacity:0'><img src='./images/cloud.png' style='width:80%;display:block'></img><img src='./images/raindrop.png' style='width:10%;position:relative;left:15px'></img><img src='./images/raindrop.png' style='width:10%;position:relative;left:30px'></img><img src='./images/raindrop.png' style='width:10%;position:relative;top:15px'></img>	<img src='./images/raindrop.png' style='width:10%;position:relative;top:15px;left:10px'></img></div><div id='futureWeather' style='position:absolute;top:130px;left:15px;font-size:0.9em;display:none;opacity:0'><table style='color:rgb(255,253,255);line-height:1em'><tr><td style='width:35px'>Sat</td><td style='width:35px'>Sun</td><td style='width:35px'>Mon</td><td style='width:35px'>Tue</td>	<td style='width:35px'>Wen</td>	</tr><tr><td><img src='./images/weather1.png' style='width:30px'></img></td><td><img src='./images/weather1.png' style='width:30px'></img></td><td><img src='./images/weather1.png' style='width:30px'></img></td><td><img src='./images/weather1.png' style='width:30px'></img></td><td><img src='./images/weather1.png' style='width:30px'></img></td></tr><tr><td style='background-color:rgb(255,253,255);color:#ff6600'>27&deg;C</td><td style='background-color:rgb(255,253,255);color:#ff6600'>32&deg;C</td><td style='background-color:rgb(255,253,255);color:#ff6600'>33&deg;C</td><td style='background-color:rgb(255,253,255);color:#ff6600'>29&deg;C</td><td style='background-color:rgb(255,253,255);color:#ff6600'>28&deg;C</td></tr></table></div></div>";
	var div = document.createElement("div");
	div.innerHTML = comOrangeWeather;
	document.getElementsByClassName("page")[pageIndex-1].appendChild(div.firstChild);
	var imgSrc = "./images/sprite1.png";	
	var flashWindow = document.getElementById("flash");
	flashWindow.style.top = 0;
	console.log(pageIndex);
	var flashWinCon = {el: flashWindow, width:240, height:130};
	var movieArray = [{left:10000,top:10000},{left:0,top:0},{left:240,top:0},{left:480,top:0},{left:720,top:0},{left:960,top:0},{left:1200,top:0},{left:1440,top:0},{left:1680,top:0},{left:1920,top:0},{left:2160,top:0},{left:2400,top:0},
					  {left:2640,top:0},{left:2880,top:0},{left:3120,top:0},{left:3360,top:0},{left:3600,top:0},{left:3840,top:0},{left:4080,top:0}];
	
	var movieArray2 = [{left:0,top:0},{left:240,top:0},{left:480,top:0},{left:720,top:0},{left:960,top:0}];
	var SM;
	var isShown = false;	
	var infoEl = document.getElementById("info");
	infoEl.style.webkitTransform = "rotate(90deg)";
	el.onclick = function(){
		a.yield(this.getAttribute("elPos"), "right", 3);
		flashWindow.style.display = "block";
		SM = new spriteMovie(imgSrc, flashWinCon, movieArray);
		if(flashWindow.isClickLocked)
			return ;			
		if(isShown){
			disapear();
		}
		else{
			setTimeout(function(){			
				stretchTo3();
				a.isWidgetShow = true;
			},100);
		}
	}
	
	function disapear(){
		SM.rewind(24);
		isShown = false;
		infoEl.style.webkitTransform = "rotate(90deg)";
		infoEl.style.opacity = "0";
		infoEl.style.webkitTransitionDuration = '600ms';
		document.getElementById("pic").style.opacity = "0";
		clearInterval(window.raindrop);
		setTimeout(function(){
			a.withdraw(el.getAttribute("elPos"), "left", 3);
			flashWindow.style.display = "none";
			a.isWidgetShow = false;
		},800);
	}
			
	function stretchTo3(){
		SM.play(24);
		isShown = true;
		infoEl.style.webkitTransform = "rotate(0deg)";
		infoEl.style.opacity = "0.9";
		infoEl.style.webkitTransitionDuration = '600ms';
		setTimeout(function(){
			document.getElementById("pic").style.opacity = "0.9";
		},800);
		var pic = document.getElementById("pic");
		var img = pic.getElementsByTagName("img");
		window.raindrop = setInterval(function(){	
			for(var i=1; i<img.length; i++){
				img[i].style.opacity = Math.random();
			}
		}, 500);
	}
	
	flashWindow.ontouchstart = function(e){
		this.startX =  e.touches[0].pageX;
		this.startY =  e.touches[0].pageY;
	}
	flashWindow.ontouchmove = function(e){
		var pageX = e.touches[0].pageX;
		var pageY = e.touches[0].pageY;
		var dx = pageX-this.startX;
		var dy = pageY-this.startY;
		if(Math.abs(dy)>Math.abs(dx)){
			if(dy>0)
				this.wipeDirection = "down";
			else
				this.wipeDirection = "up";
		}
		else{
			if(dx>0)
				this.wipeDirection = "right";
			else
				this.wipeDirection = "left";
		}
	}
	flashWindow.ontouchend = function(e){
		if(this.wipeDirection === "up" && this.isClickLocked){
			var SM2 = new spriteMovie("./images/sprite2.png", {el:flashWindow, width:240, height:260}, movieArray2);
			SM2.callback = function(){
				SM = new spriteMovie(imgSrc, flashWinCon, movieArray);
				disapear();
			};
			a.withdraw(el.getAttribute("elPos"), "up", 3);
			SM2.rewind(18);
			document.getElementById("futureWeather").style.display = "none";				
			document.getElementById("futureWeather").style.opacity = "0";				
			this.isClickLocked = false;
			isShown = false;
		}
		else if(this.wipeDirection === "down" && isShown){
			a.yield(el.getAttribute("elPos"), "down", 3);
			SM = new spriteMovie("./images/sprite2.png", {el:flashWindow, width:240, height:260}, movieArray2);
			SM.play(18);
			document.getElementById("futureWeather").style.display = "block";
			var i = 0;
			var inter = setInterval(function(){
				document.getElementById("futureWeather").style.opacity = i;
				i+=0.2;
				if(i>1)
					clearInterval(inter);
			}, 100);
			this.isClickLocked = true;
		}
	}
})(el);