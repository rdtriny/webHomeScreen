!function(base){	
	//
	// Some special APIs, which is supported by browser native code. Not native interfaces.
	//
	// regListener #### 
	// 		used to add a callback function to native, when apps are ready, native code will call callback, and pass
	// 		the app list JSON.
	//
	// getDefaultIconUri ####  
	//		used to fetch a default image, before the real images are loaded, show default images.
	//
	//  launchApp ####
	//		launch an specific android activity
	//
	base.Browser = base.extend( base.Browser, {
		regListener : function(callbackName){
			window.nativeapps.setWebUpdateContentCallback(callbackName);
		},	
		getDefaultIconUri : function(){
			// If the icons aren't prepared, use a default icon.
			return window.nativeapps.getDefaultAppIconUri();
		},
		//identification is like this: com.orange.browser/com.a.b
		launchApp : function(identification){
			// identification stands for the id of appliction div, which is like : com.*.*/com.*.*.*Activity
			var array = identification.split('/');
			var pkg = array[0];
			var cls = array[1];
			// native interface, two arguments: package name and activity name.
			window.nativeapps.launchActivity(pkg, cls);
		},
		// hijack the hardkey pressing by native app, because javascript can't do that.
		hardkey: function(callbackName){
			window.nativeapps.setWebKeyEventCallback(callbackName);
		},
		// vibration.
		vibrate: function(milliseconds){
			window.nativeapps.vibrate(milliseconds);
		}
	});
	
	_Base_ = base;
}(_Base_);