
window.addEventListener('load', function(){		
	_Base_.System.run("iconsContainer",{isVertical:true, appsPerRow:4, appsPerColumn:4});
}, false);

// avoid the 'undefined' error when native code this function.
function updateContent(){}

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