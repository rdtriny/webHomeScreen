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
				
				// It's a flag to direct the widgets' action.
				base.Widget.isWidgetShow = false;
				
				// add the favorite tray area.
				base.Tray.addFixedArea();
				
				// some sound effect.
				base.Sound.loadAudio("./mp3.mp3");
		},
		run: function(container, config){
			base(config);
			base.System.init(container);
			// this is the callback function when init. native code can only access the properties of window.
			window.loadRes = base.System.loadRes;
			base.Browser.regListener("loadRes");			
			base.System.showVersion();
		},
		// parse the applications' JSON info and then register them.
		loadRes: function(appListJson, lastBatch){
			var apps, defaultUri = base.Browser.getDefaultIconUri();
			apps = eval(appListJson);
			var len = apps.length;
			var icon, label;
			for (var i = 0; i < apps.length; i++){
				var icon = defaultUri;
				if (apps[i].iconUri != null) {
					icon = apps[i].iconUri;
				}
				label = apps[i].label || "LOADING";
				if(i == 0)
					base.App.register({title:label,packageName:apps[i].appPackage+"/"+apps[i].appClass,imgSrc:icon,widget:"./widget/weather.js"});
				else
					base.App.register({title:label,packageName:apps[i].appPackage+"/"+apps[i].appClass,imgSrc:icon,widget:""});
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
			var container = base.container,
				pagesCount = base.Page.pagesCount,
				appsPerRow = base.Config.appsPerRow,
				appsPerColumn = base.Config.appsPerColumn;
				
			var icons = container.getElementsByClassName("icon");
			if(base.Config.isVertical){
				container.style.height = 100 * pagesCount+"%";
				for(var i=0; i<icons.length; i++){
					icons[i].style.height = 100/( pagesCount * appsPerColumn)+"%";						
					icons[i].style.left = (i%appsPerRow) * (100/appsPerRow)+"%";
					icons[i].style.top = Math.floor(i/appsPerColumn) * 100/(pagesCount * appsPerColumn)+"%";
				}
			}
		},		
		//
		// a brief version information
		//
		version: '2.1.5 beta',
		showVersion: function(){
			base.Debug.log('Version: '+base.System.version);
			return base.System.version;
		},
	});
	_Base_ = base;
}(_Base_);