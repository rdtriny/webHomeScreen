!function(base){		
	base.Helper = base.extend(base.Helper, {
		// parse to float
		toNum : function(arg){
			var result = parseFloat(arg);
			if(isNaN(result)){
				result = 0;
			}
			return result;
		}
	});
}(_Base_);