// sprite image Movie player 
var spriteMovie = (function(){
	function spriteMovie(imgSrc, flashWindowConf, movieArray){
		this.imgSrc = imgSrc;
		this.flashWindow = flashWindowConf;
		this.movieArray = movieArray;
		this.loadImage(imgSrc);
	}
	
	spriteMovie.prototype = {
		isImageLoad: false,
		isbgset: false,
		loadImage: function(imgSrc, callback){
			var img = new Image();
			img.src = imgSrc;
			var that = this;
			img.onload = function(){
				console.log("image load completed!");
				that.isImageLoad = true;
				if(callback && typeof callback == "function"){
					callback();
				}
				var notice = document.getElementById("notice");
				if(notice){
					notice.innerHTML = "Load completed!";
				}
			}
		},
		setFlashWindow: function(config, movieArray, startPos){
			config.el.style.width = config.width+"px";
			config.el.style.height = config.height+"px";
			var that = this;
			var bgInterval = setInterval(function(){
				if(that.isImageLoad){
					config.el.style.background = "url("+that.imgSrc+") top left no-repeat";
					config.el.style.backgroundPosition = "-"+ movieArray[startPos].left +"px -"+ movieArray[startPos].top +"px";
					that.isbgset = true;
					if(that.wantPlayFps){
						that.play(that.wantPlayFps);
						that.wantPlayFps = 0;
					}else if(that.wantRewindFps){
						that.rewind(that.wantRewindFps);
						that.wantRewindFps = 0;
					}
					clearInterval(bgInterval);
				}
			},10);
		},
		play: function(fps){
			this.setFlashWindow(this.flashWindow, this.movieArray, 0);
			fps = fps || 16;
			var time = 1000/fps;
			this.wantPlayFps = fps;
			if(this.isbgset){
				this.wantPlayFps = 0;
				var that = this;
				this.frame = this.frame || 0;
				clearInterval(this.start);
				this.start = setInterval(function(){
					that.flashWindow.el.style.backgroundPosition = "-"+that.movieArray[that.frame].left + "px -" +that.movieArray[that.frame].top+"px";
					that.frame==(that.movieArray.length-1) ? (that.frame=0,that.stop()):(that.frame ++);
				}, time);
			}
		},
		stop: function(){
			if(this.start){
				clearInterval(this.start);
				this.frame = 0;
			}
		},
		pause: function(){
			if(this.start){
				clearInterval(this.start);
			}
		},
		rewind: function(fps){
			this.setFlashWindow(this.flashWindow, this.movieArray, this.movieArray.length-1);
			fps = fps || 16;
			var time = 1000/fps;
			this.wantRewindFps = fps;
			if(this.isbgset){
				this.wantRewindFps = 0;
				var that = this;
				var frame = (this.movieArray.length-1);
				clearInterval(this.start);
				this.start = setInterval(function(){
					that.flashWindow.el.style.backgroundPosition = "-"+that.movieArray[frame].left + "px -" +that.movieArray[frame].top+"px";
					if(frame == 0){
						if(that.callback){
							console.log("call back");
							that.callback();
						}
						clearInterval(that.start);								
					}
					else{
						frame --;
					}
				}, time);
			}
		}
	};
	return spriteMovie;
})();