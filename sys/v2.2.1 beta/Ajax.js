!function(base){
	// 
	// Ajax module
	// containing two main query method, GET and POST
	// query string in post method are transfered as form-data.
	//
	base.Ajax = base.extend(base.Ajax, {
		config: {type : "GET",
				isAsy : true,
				contentType: "application/x-www-form-urlencoded"
		},
		
		setConfig: function(type, isAsy, contentType){
			if( typeof type == "string" )
				base.Ajax.config.type = type;
			if( typeof contentType == "string" )
				base.Ajax.config.contentType = contentType;
			if( typeof isAsy == "boolean")
				base.Ajax.config.isAsy = isAsy;
			else if(typeof isAsy == "string"){
				if(isAsy == 'true')
					base.Ajax.config.isAsy = true;
				else if(isAsy == 'false')
					base.Ajax.config.isAsy = false;
			}
		},
		
		ajax:function(url, data, callback){
			var xmlhttp = new XMLHttpRequest();
			
			if(this.config.type == "POST"){
				xmlhttp.open(this.config.type, url, this.config.isAsy);			
				xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");				
				xmlhttp.send(data);
			}else{
				url = encodeURI(url + '?' + data);
				xmlhttp.open(this.config.type, url, this.config.isAsy);				
				xmlhttp.send();
			}
			console.log(url, data, callback, this.config.type, this.config.isAsy, this.config.contentType);
			xmlhttp.onreadystatechange = function(){
				if(xmlhttp.status == 200){
					try{
						if(xmlhttp.responseXML){
							this.getResponseXML(xmlhttp.responseXML);
							if(typeof callback == 'function')
								callback(xmlhttp.responseXML);
						}else if(xmlhttp.responseText){
							this.getResponseStr(xmlhttp.responseText);
							if(typeof callback == 'function')
								callback(xmlhttp.responseText);
						}
						else{
							throw "The server response with no valuable entity.";
						}
					}
					catch(message){
						debug.log(message);
					}
				}
			}.bind(base.Ajax);
		},
		
		getResponseStr: function(str){			
			console.log(str);
		},
		
		getResponseXML: function(xml){
			console.log(xml.getElementsByTagName('*')[0].nodeValue);
		},
		
		//the arguments list are lined by their improtance level.
		get: function(url,  queryStr, isAsy, callback){
			var xmlhttp = new XMLHttpRequest(), bool;
			if(typeof isAsy == "boolean")
				bool = isAsy;
			else
				bool = true;
			
			url = encodeURI(url + '?' + queryStr);
			xmlhttp.open('GET', url, bool);
			xmlhttp.send();
			xmlhttp.onreadystatechange = function(){
				if(xmlhttp.status == 200){
					try{
						if(xmlhttp.responseXML){
							this.getResponseXML(xmlhttp.responseXML);
							if(typeof callback == 'function')
								callback(xmlhttp.responseXML);
						}else if(xmlhttp.responseText){
							this.getResponseStr(xmlhttp.responseText);
							if(typeof callback == 'function')
								callback(xmlhttp.responseText);
						}
						else{
							throw "The server response with no valuable entity.";
						}
					}
					catch(message){
						debug.log(message);
					}
				}
			}.bind(base.Ajax);
		},
		
		post: function(url, queryStr, isAsy, callback){
			var xmlhttp = new XMLHttpRequest(), bool;
			if(typeof isAsy == "boolean")
				bool = isAsy;
			else
				bool = true;
			var data = "";
			if(typeof queryStr == "object")
				data = JSON.stringify(queryStr);
			else if(typeof queryStr == "string")
				data = queryStr;
			
			xmlhttp.open('POST', url, bool);			
			xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			xmlhttp.send(data);
			xmlhttp.onreadystatechange = function(){
				if(xmlhttp.status == 200){
					try{
						if(xmlhttp.responseXML){
							this.getResponseXML(xmlhttp.responseXML);
							if(typeof callback == 'function')
								callback(xmlhttp.responseXML);
						}else if(xmlhttp.responseText){
							this.getResponseStr(xmlhttp.responseText);
							if(typeof callback == 'function')
								callback(xmlhttp.responseText);
						}
						else{
							throw "The server response with no valuable entity.";
						}
					}
					catch(message){
						debug.log(message);
					}
				}
			}.bind(base.Ajax);
		}
	});
	_Base_ = base;
}(_Base_);