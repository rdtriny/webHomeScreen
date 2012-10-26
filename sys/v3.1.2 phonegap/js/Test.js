
window.addEventListener('load', function(){		
	_Base_.System.run("iconsContainer",{isVertical:true, appsPerRow:4, appsPerColumn:4});
	_Base_.System.loadRes("[{iconUri:'./images/launcher.png', label:'HomeScreen', appClass:'index', appPackage:'com.orange.webhomescreen'}," +
			"{iconUri:'./images/browser.png', label:'browser', appClass:'browser', appPackage:'com.orange.browser'}," +
			"{iconUri:'./images/calculator.png', label:'calculator', appClass:'calculator', appPackage:'com.orange.calculator'}," +
			"{iconUri:'./images/camera.png', label:'camera', appClass:'camera', appPackage:'com.orange.camera'}," +
			"{iconUri:'./images/clock.png', label:'clock', appClass:'clock', appPackage:'com.orange.clock'}," +
			"{iconUri:'./images/compass.png', label:'compass', appClass:'compass', appPackage:'com.orange.compass'}," +
			"{iconUri:'./images/ecamera.png', label:'ecamera', appClass:'ecamera', appPackage:'com.orange.ecamera'}," +
			"{iconUri:'./images/email.png', label:'email', appClass:'email', appPackage:'com.orange.email'}," +
			"{iconUri:'./images/flashlight.png', label:'flashlight', appClass:'flashlight', appPackage:'com.orange.flashlight'}," +
			"{iconUri:'./images/game.png', label:'game', appClass:'game', appPackage:'com.orange.game'}," +
			"{iconUri:'./images/management.png', label:'management', appClass:'management', appPackage:'com.orange.management'}," +
			"{iconUri:'./images/message.png', label:'message', appClass:'message', appPackage:'com.orange.message'}," +
			"{iconUri:'./images/nearme.png', label:'nearme', appClass:'nearme', appPackage:'com.orange.nearme'}," +
			"{iconUri:'./images/music.png', label:'music', appClass:'music', appPackage:'com.orange.music'}," +
			"{iconUri:'./images/read.png', label:'read', appClass:'read', appPackage:'com.orange.read'}," +
			"{iconUri:'./images/note.png', label:'note', appClass:'note', appPackage:'com.orange.note'}," +
			"{iconUri:'./images/number.png', label:'number', appClass:'number', appPackage:'com.orange.number'}," +
			"{iconUri:'./images/oppo.png', label:'oppo', appClass:'oppo', appPackage:'com.orange.oppo'}," +
			"{iconUri:'./images/settings.png', label:'settings', appClass:'settings', appPackage:'com.orange.settings'}," +
			"{iconUri:'./images/phonebook.png', label:'phonebook', appClass:'phonebook', appPackage:'com.orange.phonebook'}," +
			"{iconUri:'./images/phone.png', label:'phone', appClass:'phone', appPackage:'com.orange.phone'}," +
			"{iconUri:'./images/photo.png', label:'photo', appClass:'photo', appPackage:'com.orange.photo'}," +
			"{iconUri:'./images/recording.png', label:'recording', appClass:'recording', appPackage:'com.orange.recording'}," +
			"{iconUri:'./images/save.png', label:'save', appClass:'save', appPackage:'com.orange.save'}," +
			"{iconUri:'./images/set.png', label:'set', appClass:'set', appPackage:'com.orange.set'}," +
			"{iconUri:'./images/specification.png', label:'specification', appClass:'specification', appPackage:'com.orange.specification'}," +
			"{iconUri:'./images/synchronous.png', label:'synchronous', appClass:'synchronous', appPackage:'com.orange.synchronous'}," +
			"{iconUri:'./images/video.png', label:'video', appClass:'video', appPackage:'com.orange.video'}," +
			"{iconUri:'./images/weather.png', label:'weather', appClass:'weather', appPackage:'com.orange.weather'}," +
			"{iconUri:'./images/wlan.png', label:'wlan', appClass:'wlan', appPackage:'com.orange.wlan'}," +
			"{iconUri:'./images/security.png', label:'security', appClass:'security', appPackage:'com.orange.security'}," +
			"{iconUri:'./images/musics.png', label:'musics', appClass:'musics', appPackage:'com.orange.musics'}]" , true);
	
	
	// calculate the app's height and width, once for all.
	_Base_.App.getSize();
	
}, false);

window.addEventListener("gestureend", function(){
	console.log("getsteure");
}, false);

window.addEventListener("swipe", function(e){
	//console.log(e.data.direction);
}, false);

window.addEventListener("pinch", function(e){
	if(e.scale > 1){
		console.log("pinch to larger");
	}else{
		console.log("pinch to smaller");
	}
}, false);