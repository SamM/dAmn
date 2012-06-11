
// ==UserScript==
// @name           dAmnX
// @description    A tool for dAmn that makes writing plugins simple
// @author         Sam Mulqueen <sammulqueen.nz@gmail.com>
// @version        1.0.0
// @include        http://chat.deviantart.com/chat/*
// ==/UserScript==

// dAmnX v1.0.0
(function(){

var dAmnX = function(){
	var DX = this;
	this.version = "1.0.0";
	this.isReady = true;
	
	this.reinstall = function(){
		var url = window.location.href;
		window.location = "http://github.com/SamM/dAmn/raw/master/dAmnX.user.js";
		setTimeout(function(){ window.location = url }, 12000);
	}
	
	// Actions
	var before = [], after = [],
		before_id=0, after_id= 0;
	
	this.action = function(action, body, onAction, onDone){
		var self = this, f = before, i = 0, 
			j = 0, n = [], c = 0;
		
		if(typeof action != "string")
			throw "first argument `action` must be a string";
		if(typeof body == 'function'){
			onDone = onAction;
			onAction = body;
			body = {};
		}
		if(typeof body != "object")
			body = {};
		if(typeof onAction != "function") 
			onAction = function(body, callback){ callback(body); };
		if(typeof onDone != "function") 
			onDone = function(body){ };
			
		body['action'] = action;
		
		function match_cycle(_body){
			if(_body) body = _body;
			if(i == f.length) (c==0?before_cycle:after_cycle)(body);
			else {
				var o = f[i++];
				o.action.call(self, body, function(match){
					if(match == true) n.push(o);
					match_cycle();
				});
			}
		}
		function before_cycle(_body){
			if(j == n.length) end_before_cycle(_body);
			else{
				var o = n[j++];
				if(typeof o.before == 'function')
					o.before.call(self, _body, before_cycle);
				else
					before_cycle(_body);
			}
		}
		function end_before_cycle(_body){
			f = after;
			n = [];
			j = 0;
			i = 0;
			c++;
			onAction.call(self, _body, match_cycle);
		}
		function after_cycle(_body){
			if(j == n.length) end_after_cycle(_body);
			else{
				var o = n[j++];
				if(o && typeof o.after == 'function')
					o.after.call(self, _body, after_cycle);
				else
					after_cycle(_body);
			}
		}
		function end_after_cycle(_body){
			onDone.call(this, _body);
		}

		match_cycle(body);
		
		return this;
	}
	function getMatchFunction(action, after){
		if(typeof action == "object")
			action = (function(a){ 
				return function(body, done){
					var match = true;
					for(var i in a){
						match = match && (typeof a[i]=="function" ? !!a[i](body[i]) : (typeof body[i] != 'undefined' && body[i] == a[i]));
					}
					done(match);
				};
			})(action);
		else if(typeof action != "function")
			action = (function(a){
				return function(body, done){ done(body.action == a); };
			})(action);
		return action;
	}
	this.before = function(action, onBefore){
		if(typeof onBefore!='function')
			throw "second argument `onBefore` must be a function";
		
		var id = before_id++;
			
		before.push({ 'id': id, 'action': getMatchFunction(action), 'before': onBefore });
		
		return id;
	}
	this.after = function(action, onAfter){
		if(typeof onAfter!='function')
			throw "second argument `reaction` must be a function";

		var id = after_id++;
			
		after.push({ 'id': id, 'action': getMatchFunction(action, 1), 'after': onAfter });
		
		return id;
	}
	this.before.destroy = function(id){
		var f = before, n = [], removed = false;
		for(var i=0;i<f.length;i++){
			if(id == f[i].id) removed = true;
			else n.push(f[i]);
		}
		if(removed) before = n;
		return removed;
	}
	this.after.destroy = function(id){
		var f = after, n = [], removed = false;
		for(var i=0;i<f.length;i++){
			if(id == f[i].id) removed = true;
			else n.push(f[i]);
		}
		if(removed) after = n;
		return removed;
	}
	this.before.clear = function(){
		before = [];
	}
	this.after.clear = function(){
		after = [];
	}
	
	//
	// command
	//
	
	this.command = {
   		commands: {},
   		bind: function(cmd, params, fn){
 			params = params ? 1 : 0;
   			cmd = cmd.toLowerCase();

   			DX.command.commands[cmd] = [params,fn];

			Object.each(dAmnChats, function(chatObj, chatName){
				chatObj.channels.main.input.cmds[cmd] = [params, 'dAmnX']
			});
   		},
   		unbind: function(cmd){
   			cmd = cmd.toLowerCase();
   			if(cmd in DX.command.commands){
   				delete DX.command.commands[cmd];
				Object.each(dAmnChats, function(chatObj){
					delete chatObj.channels.main.input.cmds[cmd];
				});
   			}
   		},
   		trigger: function(cmd, args){
   			cmd = cmd.toLowerCase();
   			if(cmd in DX.command.commands){
			   				return DX.command.commands[cmd][1](typeof args == 'string'?args:'');
   			}
			return null;
   		},
        change: function(cmd, fn, params){
            if(DX.command.commands[cmd]){
			    DX.command.commands[cmd] = [params, fn];
	            }else{
                DX.command.bind(cmd, fn, params);
            }
        }
   	}
	
	// Cookie Functions
	
	this.cookie = {
		set: function(name, value, days) {
			var expires;
			if (days) {
				var date = new Date();
				date.setTime(date.getTime()+(days*24*60*60*1000));
				expires = date.toGMTString();
			}
			else expires = "";
			
			if(!value) value = "";
			if(typeof value == number) value += "";
			if(typeof value != 'string')
				throw new Error("Second argument `value` must be a string");
			if(value.indexOf(";")>-1)
				throw new Error("Second argument `value` cannot contain any semi-colons; ");
			
			document.cookie = [name+"="+value, "expires="+expires, "path=/", "domain=chat.deviantart.com"].join("; ");
		},
		get: function(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split('; ');
			for(var i=0;i < ca.length;i++) {
				if(ca[i].indexOf(nameEQ)==0)
					return ca[i].slice(nameEQ.length+1);
			}
			return null;
		},
		erase: function(name) {
			DX.cookie.set(name,"",-1);
		}
	}
	
	// dAmn Send Methods
	
	this.send = {
    	action: function(channel, msg){
    		channel = DX.channelNs(channel);
    		dAmnChats[channel].Send( "action","main", msg );
    	},
    	admin: function(channel, args){
    		channel = DX.channelNs(channel);
    		dAmnChats[channel].Send( "admin", "", args );
    	},
    	ban: function(channel, user){
    		channel = DX.channelNs(channel);
    		dAmnChats[channel].Send( "ban", user, "" );
    	},
    	chat: function(user){
    		// Note: Not currently enabled by dAmn
    		dAmn_Join( dAmn_format_pchat_ns(dAmn_Client_Username, user) );
    	},
    	clear: function(channel){
    		channel = DX.channelNs(channel);
    		dAmnChats[channel].Clear();
    	},
    	demote: function(channel, user, privclass){
    		channel = DX.channelNs(channel);
    		dAmnChats[channel].Send("demote",user,privclass);
    	},
    	join: function(channel){
    		channel = DX.channelNs(channel);
			dAmn_Join( channel );
    	},
    	kick: function(channel, user, reason){
    		channel = DX.channelNs(channel);
    		dAmn_Kick( channel, user, dAmnEscape(reason) );
    	},
    	kill: function(user, conn, reason){
    		dAmn_Kill( user, conn, reason );
    	},
    	msg: function(channel, msg){
    		channel = DX.channelNs(channel);
    		dAmnChats[channel].Send( "msg","main", msg );
    	},
    	npmsg: function(channel, msg){
    		channel = DX.channelNs(channel);
    		dAmnChats[channel].Send( "npmsg","main", msg );
    	},
    	part: function(channel){
    		channel = DX.channelNs(channel);
    		dAmn_Part( channel );
    	},
    	promote: function(channel, user, privclass){
    		channel = DX.channelNs(channel);
    		dAmnChats[channel].Send("promote",user,privclass);
    	},
    	title: function(channel, msg){
    		channel = DX.channelNs(channel);
    		dAmn_Set( channel, "title", dAmnEscape(msg) );
    	},
    	topic: function(channel, msg){
    		channel = DX.channelNs(channel);
    		dAmn_Set( channel, "topic", dAmnEscape(msg) );
    	},
    	unban: function(channel, user){
    		channel = DX.channelNs(channel);
    		dAmnChats[channel].Send( "unban", user, "" );
    	},
    	whois: function(user){
    		dAmn_Get( "login:"+user, "info" );
    	},
		get: function(msg, style){
			dAmn_Get(msg, style);
		}
    };

	//
	// Update Existing dAmn Methods
	//
	
	(function updateDamn(){
		var dAmnChat_onData_DX = dAmnChat_onData;
		dAmnChat_onData = function (pkt) {
			var self = this;
			DX.action('onData', {'pkt': pkt, 'stop':false, 'self': this}, function(body, done){ if(!body.stop) self.onData_DX(body.pkt); done(body); });
		};
		dAmnChat.prototype.onData = dAmnChat_onData;
		dAmnChat.prototype.onData_DX = dAmnChat_onData_DX;
		
		var dAmnChat_onClose_DX = dAmnChat_onClose;
		dAmnChat_onClose = function(){
			var self = this;
			DX.action('onClose', {'self': this}, function(body, done){ self.onClose_DX(); done(body); });
		};
		dAmnChat.prototype.onClose = dAmnChat_onClose;
		dAmnChat.prototype.onClose_DX = dAmnChat_onClose_DX;
		
		var dAmnChat_onResize_DX = dAmnChat_onResize;
		dAmnChat_onResize = function(real) {
			var self = this;
			DX.action('onResize', {'real': real, 'stop': false, 'self': this}, function(body, done){ if(!body.stop) self.onResize_DX(body.real); done(body); });
		};
		dAmnChat.prototype.onResize = dAmnChat_onResize;
		dAmnChat.prototype.onResize_DX = dAmnChat_onResize_DX;
		
		var dAmnChat_onDisconnect_DX = dAmnChat_onDisconnect;
		dAmnChat_onDisconnect = function(reason) {
			var self = this;
			DX.action('onDisconnect', {'reason': reason, 'self': this}, function(body, done){ self.onDisconnect_DX(body.reason); done(body); });
		};
		dAmnChat.prototype.onDisconnect = dAmnChat_onDisconnect;
		dAmnChat.prototype.onDisconnect_DX = dAmnChat_onDisconnect_DX;
		
		var dAmnChat_onShutdown_DX = dAmnChat_onShutdown;
		dAmnChat_onShutdown = function() {
			var self = this;
			DX.action('onShutdown', {'self': this}, function(body, done){ self.onShutdown_DX(); done(body); });
		};
		dAmnChat.prototype.onShutdown = dAmnChat_onShutdown;
		dAmnChat.prototype.onShutdown_DX = dAmnChat_onShutdown_DX;
		
		var dAmnChat_Send_DX = dAmnChat_Send;
		dAmnChat_Send = function(cmd, channel, str) {
			var self = this;
			DX.action('send', {'cmd': cmd, 'channel': channel, 'str': str, 'str2': str, 'stop': false, 'self': this}, function(body, done){ if(!body.stop) self.Send_DX(body.cmd, body.channel, body.str); done(body); });
		};
		dAmnChat.prototype.Send = dAmnChat_Send;
		dAmnChat.prototype.Send_DX = dAmnChat_Send_DX;

		dAmnChanChat.prototype.Clear_DX = dAmnChanChat.prototype.Clear;
		dAmnChanChat.prototype.Clear = function() {
			var self = this;
			DX.action('clear', {'self': this}, function(body, done){ self.Clear_DX(); done(body); });
		};

		var dAmnChatTabs_activate_DX = dAmnChatTabs_activate;
		dAmnChatTabs_activate = function( id , real ) {
			var self = this;
			DX.action('onTabActivate', {'id': id, 'real': real, 'self': this}, function(body, done){ dAmnChatTabs_activate_DX(body.id, body.real); done(body); });
		};
		
		var dAmnChatInput_onKey_DX 	= dAmnChatInput_onKey;
		dAmnChatInput_onKey = function(e,kc,force)
		{
			try{
			var self = this,
				el = this.chatinput_el;
				
			DX.action('onKey', {'e': e, 'keyCode': kc, 'force': force, 'self': this});
			
			if(kc != 9){
				if (!self.multiline) {
					self.prev_multiline_str = null
		        }
				if (kc == 13 && ( force || !self.multiline || e.shiftKey || e.ctrlKey ) && el.value && !(e.shiftKey || (!self.multiline && e.ctrlKey))){
					var cmdre = el.value.match( /^\/([a-z]+)([\s\S]*)/m );
					if (cmdre){
						var cmd  = cmdre[1].toLowerCase();
						var args = null;
						if (cmdre[2]) {
							var tmp = cmdre[2].match(/^\s([\s\S]*)/);
							if( tmp && tmp.length )
								args = tmp[1];
						}

						if(self.cmds[cmd] && self.cmds[cmd][1] == "dAmnX") {
							dAmnChatTabs_activate( self.cr.ns, true );
							delete self.tablist;
							if (self.history_pos != -1  && self.history[self.history_pos] == el.value) {
								var before = self.history.slice(0,self.history_pos);
								var after  = self.history.slice(self.history_pos+1);
								self.history = before.concat(after).concat( self.history[self.history_pos] );
							} else {
								self.history = self.history.concat( el.value );
								if( self.history.length > 300 )
									self.history = self.history.slice(1);
							}
							self.history_pos = -1;
							
							if(self.cmds[cmd][0] && !args){
								DX.error(cmd, "insufficient parameters");
							}else{
								DX.action('command', {'command': cmd, 'args': args||'', 'self': self}, function(b,c){ el.value = DX.command.trigger(b.command, b.args) || ''; c(b) });
							}
							
							el.focus();
							el.value = '';
							
							return false;
						}
					}
				}

	        }
			return this.onKey_DX(e,kc,force);
		}catch(ex){
			console.log(ex);
			return false;
		}
		};
		
		dAmnChatInput.prototype.onKey = dAmnChatInput_onKey;
		dAmnChatInput.prototype.onKey_DX = dAmnChatInput_onKey_DX;
		
		dAmnChanChat.prototype.Init_DX 	= dAmnChanChat.prototype.Init;
		dAmnChanChat.prototype.Init 	= function( cr, name, parent_el ){
			var self = this;
			DX.action('init', {'cr': cr, 'name': name, 'parent_el': parent_el, 'self': this},  function(b,c){ self.Init_DX(b.cr, b.name, b.parent_el); c(b); })
		};
		
		dAmnChanMainChat.prototype.onEvent_DX = dAmnChanMainChat.prototype.onEvent;
		dAmnChanMainChat.prototype.onEvent = function(pkt){
			var self = this;
			DX.action('event', {'pkt': pkt, 'self': this}, 
				function(body, done){ self.onEvent_DX(body.pkt); done(body) });
		}
		
		dAmnChanMainChat.prototype.onSelfEvent_DX = dAmnChanMainChat.prototype.onSelfEvent;
		dAmnChanMainChat.prototype.onSelfEvent = function( ev, arg1, arg2 ){
			var self = this;
			DX.action('selfEvent', {'ev': ev, 'arg1': arg1, 'arg2': arg2, 'self': this}, 
				function(body, done){ self.onSelfEvent_DX(body.ev, body.arg1, body.arg2); done(body) });
		}
		
	}).call(this);
	
	(function initialEvents(){
		//
		// Events
		//
		this.before('onTabActivate', function(body, done){ 
			if(body.id != dAmnChatTab_active) 
				DX.action('onSwitchTab', {'id': body.id, 'real': body.real, 'self': body.self}, function(b,c){ c(b) }); 
			done(body);
		})
		this.after("init", function(b,c){
			for(var cmd in DX.command.commands)
				b.self.input.cmds[cmd] = [DX.command.commands[cmd][0], 'dAmnX'];
			c(b);
		});
		this.before('onData', function(b,c){
			var ev = null;
			switch (b.pkt.cmd) {
				case 'join': 	ev="selfJoin"; break;
				case 'part': 	ev="selfPart"; break;
				case 'kicked': 	ev="selfKicked"; break;
				case 'set' :
				case 'get' :
				case 'send': 	ev="onError"; break;
				case 'property': ev="property"; break;
				case 'recv': 	ev="recv"; break;
			}
			if(ev) this.action(ev, {'pkt': b.pkt, 'self': b.self, 'stop': false}, 
				function(body, done){ if(body.stop) b.stop=true; b.pkt = body.pkt; c(b); done(body); });
			else c(b);
		});
		this.before('property', function(b,c){
			var ev = b.pkt.args.p;

			if(["members", "privclasses", "title", "topic"].indexOf(ev)>-1) 
				this.action(ev, {'pkt': b.pkt, 'self': b.self, 'stop': false}, 
					function(body, done){ if(body.stop) b.stop=true; b.pkt = body.pkt; c(b); done(body); });
			else c(b);
		})
		this.before('recv', function(b,c){
			var rp = dAmn_ParsePacket(b.pkt.body),
				ev = rp.cmd;

			if(["action", "msg", "part", "kicked", "join", "privchg"].indexOf(ev)>-1)
				this.action(ev, {'pkt': b.pkt, 'self': b.self, 'stop': false}, function(body, done){ if(body.stop) b.stop=true; b.pkt = body.pkt; c(b); done(body); });
			else c(b);
		});
		this.before('send', function(b,c){
	        var ev = b.cmd,
				ev2 = "send"+ev[0].toUpperCase() + ev.slice(1);

			if(["action", "msg", "npmsg"].indexOf(ev)>-1)
				this.action(ev2, {'channel': b.channel, 'str': b.str, 'stop': false}, 
					function(body, done){ if(body.stop) b.stop=true; b.channel = body.channel; b.str = body.str; c(b); done(body); });
			else c(b);
	    });
		this.before('title', function(b,c){
			this.titles[b.pkt.param] = this.parseMsg(b.pkt.body);
			c(b);
		});
		this.before('topic', function(b,c){
			this.topics[b.pkt.param] = this.parseMsg(b.pkt.body);
			c(b);
		});
	}).call(this);

	//
	// Utitily Functions
	//
	
	Object.each = function(obj, func, thisv){
		for(var k in obj)
			func.call(thisv||this, obj[k], k);
	}
	
	this.serialize = function(a){
        var s = [];
        if(a.constructor != Array)
            for( var j in a )
                s.push(encodeURIComponent( j ) + "=" + encodeURIComponent( a[j] ) );
        return s.join("&").replace(/%20/g, "+");
    }

	this.getChannel = function(channel){
    	channel = this.channelNs(channel);
    	return dAmnChats[channel];
    };
    this.channelNs = function(a){
    	if(!a) return dAmnChatTab_active;
		if(a.match(/^pchat:[a-zA-Z0-9-]+:[a-zA-Z0-9-]+$/))
			return a;
		a=a.replace("chat:","");
		a=a.replace("#","");
		return"chat:"+a;
    };

	this.titles = {};
	this.topics = {};
	
    this.getChannelTitle = function(channel){
    	channel = this.channelNs(channel);
    	if(channel in this.titles)
    		 return this.parseMsg(this.titles[channel]);
    	else return this.getChannel(channel).title_el.innerHTML;
    }
    this.getChannelTopic = function(channel){
    	channel = this.channelNs(channel);
    	if(channel in this.topics)
    		 return this.parseMsg(this.topics[channel]);
    	else return null;
    }

	this.error = function(evt, err){
		this.getChannel().channels.main.cr.channels.main.onErrorEvent(evt, err);
	}
	
	this.notice = function(str, spanClass, timeout){
   		var chan = this.channelNs();
   		spanClass = spanClass?spanClass:"";
   		dAmn_addTimedDiv( dAmnChats[chan].channels.main.error_el, "damn-error "+spanClass, str, timeout );
   	}

	this.setInput = function(chan, text){
		chan = this.channelNs(chan);
		dAmnChats[chan].channels.main.input.chatinput_el.value = text;
	}

	this.parseMsg = function(msg) {
        // bold
			msg = msg.replace(/&b\t/g,	"<b>" );
			msg = msg.replace(/&\/b\t/g,"</b>");
        // italic
			msg = msg.replace(/&i\t/g,	"<i>" );
			msg = msg.replace(/&\/i\t/g,"</i>");
        // underline
			msg = msg.replace(/&u\t/g,	"<u>" );
			msg = msg.replace(/&\/u\t/g,"</u>");
        // strike
			msg = msg.replace(/&s\t/g,	"<s>") ;
			msg = msg.replace(/&\/s\t/g,"</s>");
        // paragraph
			msg = msg.replace(/&p\t/g,	"<p>" );
			msg = msg.replace(/&\/p\t/g,"</p>");
        // break
			msg = msg.replace(/&br\t/g,"<br/>");
        //li
			msg = msg.replace(/&li\t/g,	 "<li>" );
			msg = msg.replace(/&\/li\t/g,"</li>");
        //ul
			msg = msg.replace(/&ul\t/g,	 "<ul>" );
			msg = msg.replace(/&\/ul\t/g,"</ul>");
        //ol
			msg = msg.replace(/&ol\t/g,	 "<ol>" );
			msg = msg.replace(/&\/ol\t/g,"</ol>");
        // subscript
			msg = msg.replace(/&sub\t/g,	"<sub>" );
			msg = msg.replace(/&\/sub\t/g,	"</sub>");
        // superscript
			msg = msg.replace(/&sup\t/g,	"<sup>" );
			msg = msg.replace(/&\/sup\t/g,	"</sup>");
        // code
			msg = msg.replace(/&code\t/g,	"<code>" );
			msg = msg.replace(/&\/code\t/g, "</code>");
        // bcode
			msg = msg.replace(/&bcode\t/g,	"<bcode>" );
			msg = msg.replace(/&\/bcode\t/g,"</bcode>");
		// deviant
			msg = msg.replace(/&dev\t([^\t])\t([^\t]+)\t/g,':dev$2:');
        // link no description
			msg = msg.replace(/&link\t([^\t]+)\t&/g,'$1');
        // link with description
			msg = msg.replace(/&link\t([^\t]+)\t([^\t]+)\t&\t/g,'$1 \($2\)');
        // abbr
			msg = msg.replace(/&abbr\t([^\t]+)\t/g,'<abbr title="$1">');
			msg = msg.replace(/&\/abbr\t/g,"</abbr>");
        // acronym
			msg = msg.replace(/&acro\t([^\t]+)\t/g,'<acronym title="$1">');
			msg = msg.replace(/&\/acro\t/g,"</acronym>");
        // anchor
			msg = msg.replace(/&a\t([^\t]+)\t([^\t]*)\t/g,'<a href="$1" title="$2">');
        // avatar
			msg = msg.replace(/&avatar\t([^\t]+)\t([^\t]+)\t/g,':icon$1:');
        // img
        	msg = msg.replace(/&img\t([^\t]+)\t([^\t]*)\t([^\t]*)\t/g,'<image src="$1" />');
			msg = msg.replace(/&\/a\t/g,"</a>");
		// emote
			msg = msg.replace(/&emote\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t/g,'$1');
        // iframe
        	msg = msg.replace(/&iframe\t([^\t]+)\t([^\t]*)\t([^\t]*)\t/g,'<iframe href="$1" height="$2" width="$3" />');
        // thumbnail
			msg = msg.replace(/&thumb\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t/g,':thumb$1:');

        return msg;
    }
	
};

//
// Append script to document and initialize dAmnX
//
function execute_script(script, id){
	var el = document.createElement('script');
	if(id) el.id = id;
	el.appendChild(document.createTextNode(script));
	document.getElementsByTagName("head")[0].appendChild(el);
	return el;
}

var jStorage_script=execute_script("("+function(){(function(a){function k(){var a=false;if("localStorage"in window){try{window.localStorage.setItem("_tmptest","tmpval");a=true;window.localStorage.removeItem("_tmptest")}catch(b){}}if(a){try{if(window.localStorage){c=window.localStorage;h="localStorage"}}catch(e){}}else if("globalStorage"in window){try{if(window.globalStorage){c=window.globalStorage[window.location.hostname];h="globalStorage"}}catch(f){}}else{d=document.createElement("link");if(d.addBehavior){d.style.behavior="url(#default#userData)";document.getElementsByTagName("head")[0].appendChild(d);d.load("jStorage");var g="{}";try{g=d.getAttribute("jStorage")}catch(i){}c.jStorage=g;h="userDataBehavior"}else{d=null;return}}l();o()}function l(){if(c.jStorage){try{b=g(String(c.jStorage))}catch(a){c.jStorage="{}"}}else{c.jStorage="{}"}e=c.jStorage?String(c.jStorage).length:0}function m(){try{c.jStorage=f(b);if(d){d.setAttribute("jStorage",c.jStorage);d.save("jStorage")}e=c.jStorage?String(c.jStorage).length:0}catch(a){}}function n(a){if(!a||typeof a!="string"&&typeof a!="number"){throw new TypeError("Key name must be string or numeric")}if(a=="__jstorage_meta"){throw new TypeError("Reserved key name")}return true}function o(){var a,c,d,e=Infinity,f=false;clearTimeout(i);if(!b.__jstorage_meta||typeof b.__jstorage_meta.TTL!="object"){return}a=+(new Date);d=b.__jstorage_meta.TTL;for(c in d){if(d.hasOwnProperty(c)){if(d[c]<=a){delete d[c];delete b[c];f=true}else if(d[c]<e){e=d[c]}}}if(e!=Infinity){i=setTimeout(o,e-a)}if(f){m()}}if(!a||!(a.toJSON||Object.toJSON||window.JSON)){throw new Error("jQuery, MooTools or Prototype needs to be loaded before jStorage!")}var b={},c={jStorage:"{}"},d=null,e=0,f=a.toJSON||Object.toJSON||window.JSON&&(JSON.encode||JSON.stringify),g=a.evalJSON||window.JSON&&(JSON.decode||JSON.parse)||function(a){return String(a).evalJSON()},h=false,i,j={isXML:function(a){var b=(a?a.ownerDocument||a:0).documentElement;return b?b.nodeName!=="HTML":false},encode:function(a){if(!this.isXML(a)){return false}try{return(new XMLSerializer).serializeToString(a)}catch(b){try{return a.xml}catch(c){}}return false},decode:function(a){var b="DOMParser"in window&&(new DOMParser).parseFromString||window.ActiveXObject&&function(a){var b=new ActiveXObject("Microsoft.XMLDOM");b.async="false";b.loadXML(a);return b},c;if(!b){return false}c=b.call("DOMParser"in window&&new DOMParser||window,a,"text/xml");return this.isXML(c)?c:false}};a.jStorage={version:"0.1.7.0",set:function(a,c,d){n(a);d=d||{};if(j.isXML(c)){c={_is_xml:true,xml:j.encode(c)}}else if(typeof c=="function"){c=null}else if(c&&typeof c=="object"){c=g(f(c))}b[a]=c;if(!isNaN(d.TTL)){this.setTTL(a,d.TTL)}else{m()}return c},get:function(a,c){n(a);if(a in b){if(b[a]&&typeof b[a]=="object"&&b[a]._is_xml&&b[a]._is_xml){return j.decode(b[a].xml)}else{return b[a]}}return typeof c=="undefined"?null:c},deleteKey:function(a){n(a);if(a in b){delete b[a];if(b.__jstorage_meta&&typeof b.__jstorage_meta.TTL=="object"&&a in b.__jstorage_meta.TTL){delete b.__jstorage_meta.TTL[a]}m();return true}return false},setTTL:function(a,c){var d=+(new Date);n(a);c=Number(c)||0;if(a in b){if(!b.__jstorage_meta){b.__jstorage_meta={}}if(!b.__jstorage_meta.TTL){b.__jstorage_meta.TTL={}}if(c>0){b.__jstorage_meta.TTL[a]=d+c}else{delete b.__jstorage_meta.TTL[a]}m();o();return true}return false},flush:function(){b={};m();return true},storageObj:function(){function a(){}a.prototype=b;return new a},index:function(){var a=[],c;for(c in b){if(b.hasOwnProperty(c)&&c!="__jstorage_meta"){a.push(c)}}return a},storageSize:function(){return e},currentBackend:function(){return h},storageAvailable:function(){return!!h},reInit:function(){var a,b;if(d&&d.addBehavior){a=document.createElement("link");d.parentNode.replaceChild(a,d);d=a;d.style.behavior="url(#default#userData)";document.getElementsByTagName("head")[0].appendChild(d);d.load("jStorage");b="{}";try{b=d.getAttribute("jStorage")}catch(e){}c.jStorage=b;h="userDataBehavior"}l()}};k()})(window.$||window.jQuery)}.toString()+")()")

var DX_script = execute_script("var dAmnX = window.dAmnX = new (" + dAmnX.toString() + ")();", "dAmnX_Script");

})();