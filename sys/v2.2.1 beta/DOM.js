!function(base){	
	//
	// APIs related to DOM node
	//
	// removeAllChild : remove all children of a specified node.
	// parameters: 
	//		node ###  the Node whose's children will be removed.
	// example:
	// 		base.DOM.remove(document.body);
	//
	//
	
	/*
	 |	base.DOM is a function for node selecting.
	 |		usage:
	 |		  _Base_.DOM(selector[, documentScope])
	 |
	 |		Supprot id, class, tagname for now.
	*/
	
	var quickReg = /(\w+)?[#.]?(\w+)*/;
	
	base.DOM = function(selector, scope){
		return new base.DOM.select(selector, scope);
	};
	
	base.DOM.select = function(){
		var ret = [];
		var selector = arguments[0],
			scope = arguments[1] || window.document;
		
		if(scope.nodeType !== 1 && scope.nodeType !== 9){
			scope = window.document;
		}
		if(!selector){
			return this;
		}
		if(typeof selector === 'object' && selector.nodeType === 1){
			this.selector = selector;
			return this;
		}
		if(typeof selector === 'string'){
			var selectArray = selector.trim().split(' ');
			for(var i = 0; i<selectArray.length; i++){
				var match = quickReg.exec(selectArray[i]);
				if( match ){
					if(match[2]){
						if(match[0].indexOf('#') != -1){
							var node = document.getElementById(match[2]);
							if(!match[1])
								ret.push(node);
							else if( node.nodeName === match[1].toUpperCase() )
								ret.push(node);
						}
						else{
							node = Array.prototype.slice.call(scope.getElementsByClassName(match[2]));
							if( !match[1])
								ret = ret.concat(node);
							else{
								for( var i = 0; i<node.length; i++ ){
									if( node[i].nodeName === match[1].toUpperCase() )
										ret.push(node[i]);
								}
							}
						}
					}
					else{
						ret = ret.concat(Array.prototype.slice.call(scope.getElementsByTagName(match[1])));
					}
				}
			}
			this.selector = ret;
			return this;
		}
	};
	
	base.DOM.select.prototype = base.DOM;
	
	base.DOM = base.extend(base.DOM, {
		removeAllChild : function(node){
			this.selector = this.selector || [];
			node = this.selector.concat(node);
			for(var i=0; i<node.length; i++){
				if(typeof node[i] == "object" && node[i].nodeType == 1){
					while(node[i].firstChild){
						node[i].removeChild(node[i].firstChild);
					}
				}
			}
		},
		listen: function(eventType, func, bool, node){
			try{
				this.selector = this.selector || [];
				node = this.selector.concat(node);
				for(var i=0; i<node.length; i++){
					if(typeof node[i]=="object" && node[i].nodeType ==1 && ['click','dbclick','swipe','longtap','drag','pinch','touchstart','touchmove','touchend','touchcancel'].indexOf(eventType)!=-1){
						node[i].addEventListener(eventType, func, bool);
					}
					else{
						throw "wrong arguments, or event is not supported.";
					}
				}
			}
			catch(error){
				console.log(error);
			}
		},
		fire: function(eventType, element){
			this.selector = this.selector || [];
			element = this.selector.concat(element);
			for(var i=0; i<element.length; i++){
				if(typeof element[i]=="object" && element[i].nodeType ==1){
					var e = document.createEvent("Events");
					e.initEvent(eventType, true, true);
					e.target = element[i];
					element[i].dispatchEvent(e);
				}
			}
		}
	});
	
	_Base_ = base;
}(_Base_);