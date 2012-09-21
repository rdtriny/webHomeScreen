!function(base){	
	//
	// add a API debug, for logging info
	// debug is working for debug the program. Note: don't log large object in deepth like window/document, may exceed the stack size, and get error.
	//
	window.debug = base.Debug = base.extend(base.Debug, {
		log : function(){
				try{
					var str = base.Debug.stringify.apply(base.Debug, arguments).slice(0, -1);
					console.log(str);
					return str;
				}
				catch(error){
					console.log(error);
				}
		},	
		stringify : function(){
			var str="";
			for(var i=0; i<arguments.length; i++){
				var type = toString.call(arguments[i]);
				if(type.indexOf('Object') != -1){
					str += '{';
					for(var j in arguments[i]){
						str += j+':'+base.Debug.stringify(arguments[i][j]);
					}
					if(str[str.length-1] != '{')
						str = str.substr(0, str.length-1);
					str += '},';
				}
				else if(type.indexOf('Array') != -1){
					str += '[';
					for(var n=0; n<arguments[i].length; n++){
						str +=  base.Debug.stringify(arguments[i][n]);
					}
					if(str[str.length-1] != '[')
						str = str.substr(0, str.length-1);
					str +='],';
				}
				else{
					str += arguments[i]+',';				
				}
			}
			return str;
		}
	});
	
	_Base_ = base;
}(_Base_);