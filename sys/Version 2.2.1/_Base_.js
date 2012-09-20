(function(window, undefined){

	var base = function(container, config){
	
		//copy the configs into the base's prototype.
		if(config && typeof config == "object"){
			for(var i in config){
				// Don't use base.config = config, because it may cover other properties.
				base.Config[i] = config[i];
			}
		}
		
	};
	
	base.Config = {
		isVertical: false,
		// can't move background in default.
		isBGMovable: false,
		appsPerRow: 4,
		appsPerColumn: 4
	};
	
	//
	//	a interface which to include properties from other objects.
	//	example:
	//		var target = {};
	//		base.extend(target,{a:1,b:2},{c:[1,2,3]});
	//	parameters:
	//		target, the target object which wants to extend more properties.
	//		(optinal)obj, the object to give target properties.
	//		 .....
	//		(optinal)objN, the nth object to give target properties.
	//
	base.extend = function(target){
		var target = arguments[0];
		if(typeof target != "object"){
			target = {};
		}
		for(var i = 1; i<arguments.length; i++){
			var options = arguments[i];
			if(typeof options == "object"){
				for( var name in options){
					target[name] = options[name];
				}
			}
		}
		return target;
	};
	
	Array.prototype.require = base.require = function(file){
		var type = toString.call(this),
			target = [];
		if(typeof file == "string")
			target.push(file);
		if(type.indexOf('Array') != -1){
			for( var i in this){
				if(typeof this[i] == "string")
					target.push(this[i]);
			}
		}
		for(i = 0; i<target.length; i++){
			var jsFile = target[i];
			if(jsFile.slice(-3).toLowerCase() !== ".js")
				jsFile += ".js";
				
			var wdt = document.createElement("script");
			wdt.src = jsFile;
			wdt.type= "text/javascript";
			document.head.appendChild(wdt);
		}
	};

	window._Base_ = base;
	
		
	['./js/Ajax', './js/Debug', './js/DOM', './js/Browser', './js/System', './js/Drive', './js/Page', './js/App', './js/Sidebar', './js/Box', './js/Queue', './js/Widget'
	,'./js/Tray', './js/Notify', './js/Helper', './js/Sound', './js/spriteMovie'].require();
	
	window.addEventListener('load', function(){		
		_Base_.System.run("iconsContainer",{isVertical:true, appsPerRow:4, appsPerColumn:4});
	}, false);
	
})(window);

	