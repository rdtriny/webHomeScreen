!function(base){		
	base.Helper = base.extend(base.Helper, {
		// parse to float
		toNum : function(arg){
			var result = parseFloat(arg);
			if(isNaN(result)){
				result = 0;
			}
			return result;
		},
		randomColor: function(){
			var colors = [{deep: "#69c278", light: "#c4e7ca"},
						  {deep: "#c2b469", light: "#e7e2c4"},
						  {deep: "#c26969", light: "#e7c4c4"},
						  {deep: "#7869c2", light: "#cbc4e7"}];
			var result = colors[Math.floor(100*Math.random())%4];
			return result;
		}
	});
	
	_Base_ = base;
}(_Base_);