!function(base){	
	//
	// some sound effect
	// including some basic process function.
	// loadAudio: load the music file and init it.
	// playAudio: play music
	// pauseAudio: pause the playing music
	// volumeup/volumedown: control the volume.
	//
	base.Sound = base.extend( base.Sound, {
		audio: [],
		loadAudio: function(src){
			var audio = new Audio(src);
			audio.preload = "auto";
			this.audio.push(audio);
		},
		playAudio: function(index){
			this.audio[index].play();
		},
		pauseAudio: function(index){
			this.audio[index].pause();
		},
		volumeup: function(index){
			this.audio[index].volume += 0.1;
		},
		volumedown: function(index){
			this.audio[index].volume -= 0.1;
		}		
	});
	
	_Base_ = base;
}(_Base_);