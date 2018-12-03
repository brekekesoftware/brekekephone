
if( typeof Brekeke=== "undefined" || typeof Brekeke.net === "undefined" ){
	throw new Error( "jsonrpc has not been loaded." );
}
if( typeof CryptoJS === "undefined" ){
	throw new Error( "CryptoJS has not been loaded." );
}

if( typeof Brekeke.pbx === "undefined" ){
	Brekeke.pbx = {};
}

Brekeke.pbx.getPalPrototype = function(){
	if( Brekeke.pbx.prototype_pal ){
		return Brekeke.pbx.prototype_pal;
	}
	var pal = Object.create(Brekeke.net.getJsonRpcOverWebSocketPrototype());
	pal.login = function( funcOK, funcErr ){
		if( pal.login_password ){
			this.login_password_required = function( params ){
				var pw = CryptoJS.MD5( this.login_password ).toString();
				var login_str_cryp = CryptoJS.MD5( this.login_user + ":" + params.nonce + ":" + pw ).toString();
				var params = {"login_password": login_str_cryp };
				this.call( "login", params, funcOK, funcErr,	this );
			}
		}else{
			this.onOpen = function(){
				funcOK();
			}
		}
		this.open();
	};
	pal.regMethod = function( name ){
		pal[ name ] = function( params, funcOK, funcErr ){
			this.call( name, params, funcOK, funcErr,	this );
		}
	}	
	pal.methods = [
			"createExtension",
			"deleteExtension",
			"getExtensionProperties",
			"setExtensionProperties",
			"setTalkerProperties",
			"getPlanSwitchTimer",
			"setPlanSwitchTimer",
			"getExtensions",
			"createTenant",
			"getTenantProperties",
			"setTenantProperties",
			"getNoteNames",
			"getNote",
			"setNote",
			"deleteNote",
			"insertRouteVariables",
			"updateRouteVariables",
			"deleteRouteVariables",
			"getRouteTemplateNames",
			"getRouteVariables",
			"getAllDids",
			"setDid",
			"makeCall",
			"callforward",
			"barge",
			"transfer",
			"cancelTransfer",
			"park",
			"unpark",
			"startRecording",
			"stopRecording",
			"disconnect",
			"command",
			"getSystemProperties",
			"getAllUsersUC",
			"getAuthInfo",
			"getProductInfo",
			"hold",
			"unhold",
			"remoteControl",
			"info",
			"listTenants",
			"createAuthHeader",
			"conference",
			"getAppData",
			"setAppData",
			"getOptions",
			"pnmanage",
			"pnsend",
			"getPhonebooks",
			"getContactList",
			"getContact",
			"setContact",
			"getPnApplicationInfo",
			"createSessionToken",
			"getUserMenu"
	];
	for( var i = 0; i < pal.methods.length; i++ ){
		pal.regMethod( pal.methods[i] );
	}
	return pal;
}

Brekeke.net.toURLParams = function( params ){
	var p = "";
	for (var key in params) {
		var o = params[key];
		if( !o ){
			continue;
		}
		if( Array.isArray( o ) ){
			if( p.length > 0 ){
				p = p + "&";
			}
			for( var i = 0; i < o.length; i++ ){
				if( i > 0 ){
					p = p + "&";
				}
				p = p + key + "=" + encodeURIComponent( o[i] );
			}		
		}else{
			if( p.length > 0 ){
				p = p + "&";
			}
			p = p + key + "=" + encodeURIComponent( o.toString() );
		}		
	}
	return p;
}


Brekeke.pbx.getPal = function( wsurl, params  ){
	
	var pal = Object.create( Brekeke.pbx.getPalPrototype() );
	pal.login_user = params.login_user;
	var url = wsurl;
	if( false !== params.secure_login_password ){
		pal.login_password = params.login_password;
		params.login_password = null;
	}
	var p = Brekeke.net.toURLParams( params );
	if( p.length > 0 ){
		url = url + "?" + p;
	}
	pal.setUrl( url );
	return pal;
}	
	
