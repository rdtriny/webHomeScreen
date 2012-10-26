!function(base){	
	base.System = base.extend(base.System, {

		init: function(container){
			// when the document is ready, begin to setup the system.	
				if(typeof container == "string"){
					base.container = document.getElementById(container);
				}
				else if(typeof container == "object" && container.nodeType == 1){
					base.container = container;
				}

				document.body.addEventListener("touchstart", function(e){
					base.Drive.touchstart(e);
				}, false);
				
				document.body.addEventListener("touchmove", function(e){
					base.Drive.touchmove(e);
				}, false);
				
				document.body.addEventListener("touchend", function(e){
					base.Drive.touchend(e);
				}, false);
				
				document.body.addEventListener("touchcancel", function(e){
					base.Drive.touchcancel(e);
				}, false);
				
				document.body.addEventListener("click", function(e){
					base.Drive.click(e);
				}, false);
				
				// add the favorite tray area.
				base.Tray.addFixedArea();
				
				// some sound effect.
				base.Sound.loadAudio("./mp3.mp3");
		},
		run: function(container, config){
			base(config);
			base.System.init(container);
			/*
			// this is the callback function when init. native code can only access the properties of window.
			window.loadRes = base.System.loadRes;
			base.Browser.regListener("loadRes");
			*/
			base.Browser.hardkey(base.System.hardkeyListener);
			base.System.showVersion();
		},
		// parse the applications' JSON info and then register them.
		loadRes: function(appListJson, lastBatch){
			var apps, defaultUri;
			apps = eval(appListJson);
			var len = apps.length;
			var icon, label;
			for (var i = 0; i < apps.length; i++){
				var icon = defaultUri;
				if (apps[i].iconUri != null) {
					icon = apps[i].iconUri;
				}
				label = apps[i].label || "LOADING";
				
				switch(apps[i].appPackage+"/"+apps[i].appClass){
					case "com.orange.note/note":
						base.App.register({title:label,packageName:apps[i].appPackage+"/"+apps[i].appClass,imgSrc:icon,widget:"./widget/todo.js"});
						break;
					case "com.orange.musics/musics":
						base.App.register({title:label,packageName:apps[i].appPackage+"/"+apps[i].appClass,imgSrc:icon,widget:"./widget/music.js"});
						break;
					case "com.orange.message/message":
						base.App.register({title:label,packageName:apps[i].appPackage+"/"+apps[i].appClass,imgSrc:icon,widget:"./widget/message.js"});
						break;
					case "com.orange.weather/weather":
						base.App.register({title:label,packageName:apps[i].appPackage+"/"+apps[i].appClass,imgSrc:icon,widget:"./widget/weather.js"});
						break;
					case "com.orange.photo/photo":
						base.App.register({title:label,packageName:apps[i].appPackage+"/"+apps[i].appClass,imgSrc:icon,widget:"./widget/photo.js"});
						break;
					case "com.orange.set/set":
						base.App.register({title:label,packageName:apps[i].appPackage+"/"+apps[i].appClass,imgSrc:icon,widget:"./widget/settings.js"});
						break;
					case "com.orange.clock/clock":
						base.App.register({title:label,packageName:apps[i].appPackage+"/"+apps[i].appClass,imgSrc:icon,widget:"./widget/clock.js"});
						break;	
					default:						
						base.App.register({title:label,packageName:apps[i].appPackage+"/"+apps[i].appClass,imgSrc:icon,widget:""});
				}
				
			}
			if(lastBatch === "true" || lastBatch === true){
				base.System.display();
				// figure out coordinate of each application and the height of iconContainer div.
				base.System.refresh();
			}
		},
		//display all the app icons to the screen.
		display: function(){
			var appNode;
			var appsCount = base.App.appsCount;
			base.Page.pagesCount = Math.ceil(appsCount/(base.Config.appsPerRow * base.Config.appsPerColumn));
			for(var i = 0; i<appsCount; i++){
				appNode = base.Queue.queue[i];				
				base.container.appendChild(appNode);
			}
		},
		//manage the pages which is hosting app icons. inc for increment
		refresh: function(){
			var pagesCount = base.Page.pagesCount,
				appsPerRow = base.Config.appsPerRow,
				appsPerColumn = base.Config.appsPerColumn;
				
			var icons = base.Queue.queue;
			var pageHeight = document.getElementById("appScreen").clientHeight;
			// when init the page and add new pages, all the apps and widgets should be resized.
			if(base.Config.isVertical){
				base.container.style.height = pageHeight * pagesCount + "px";
				for(var i=0; i<icons.length; i++){
					base.App.resizeApp(icons[i], i);
				}
				base.Widget.refresh();
			}
		},		
		//
		// a brief version information
		//
		version: '2.1.6 beta',
		showVersion: function(){
			base.Debug.log('Version: '+base.System.version);
			return base.System.version;
		},
		hardkeyListener: function(keycode){
			// back key is pressed.
			if(keycode == 4){
				// cancel edit mode.
				if(base.App.editMode){
					base.App.Drag.closeEditMode();
				}
				else{
					var result = confirm("Exit now?");
					if(result)
						navigator.app.exitApp();
				}
				base.Debug.log("yes, it is canceled.");
			}
			// home key is pressed.
			else if(keycode == 3){
				// still launch this app.
				// set our app as home default in android setting.
			}
			else{
				//do nothing.
			}
		}
	});
	_Base_ = base;
}(_Base_);