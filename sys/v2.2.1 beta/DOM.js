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
	
	base.DOM = base.extend(base.DOM, {			
		removeAllChild : function(node){
			if(typeof node == "object" && node.nodeType == 1){
				while(node.firstChild){
					node.removeChild(node.firstChild);
				}
			}
		},
		listen: function(node, event, func, bool){
			try{
				if(typeof node=="object" && node.nodeType ==1 && ['click','dbclick','swipe','longtap','drag','pinch','touchstart','touchmove','touchend','touchcancel'].indexOf(event)!=-1){
					node.addEventListener(event, func, bool);
				}
				else{
					throw "wrong arguments, or event is not supported.";
				}
			}
			catch(error){
				console.log(error);
			}
		},
		fire: function(element, event){
			var e = document.createEvent("Events");
			e.initEvent(event, true, true);
			e.target = element;
			element.dispatchEvent(e);
		}
	});
	
	_Base_ = base;
}(_Base_);