
// ==UserScript==
// @name           dAmnGoodies
// @description    Novelty features for dAmn chat.
// @author         Sam Mulqueen <sammulqueen.nz@gmail.com>
// @version        2.0.1
// @include        http://chat.deviantart.com/chat/*
// ==/UserScript==

function init(){
	
	var DGREV = 0;
	
	Array.prototype.each = function(fn, thisv){
		if(this.length){
			for(var i=0; i<this.length; i++)
				fn.call(thisv||this, this[i], i);
		}
	}
	if(dAmnGoodies){
		alert("You have multiple versions of dAmnGoodies installed.");
		throw "Aw hell no";
	}
	var dAmnGoodies = function(){
		this.version = "2.0.1";
		this.rev = DGREV;
		
		var DG = this;
		
		this.username = dAmn_Client_Username;
		
		this.goodies = {};
		this.goodie = function(name, data, setUp){
			var newData;
			this.goodies[name] = this.goodies[name] || data || {};
			if(typeof setUp == 'function')
				newData = setUp.call(this, data);
			if(typeof newData == 'object')
				this.goodies[name] = newData;
			return this;
		}
		
		this.save = function(){
			$.jStorage.set("dAmnGoodies", DG.goodies);
			return this;
		}
		
		this.load = function(){
			var loaded = $.jStorage.get("dAmnGoodies");
			
			if(!loaded || typeof loaded != 'object')  loaded = {};
			
			DG.goodies = loaded;
			return this;
		}
		
		this.reinstall = function(){
			var url = window.location.href;
			window.location = "http://github.com/SamM/dAmn/raw/master/dAmnGoodies2.user.js";
			setTimeout(function(){ window.location = url }, 10000);
		}
		
		this.init = function(){
			
			this.load();
			
			// Goodies
			this.goodie('goodies', {enabled: true}, function(){
				dAmnX.command.bind('goodies', 1, function(args){
					var a = args.split(' ');
					switch(a[0]){
					case 'save':
						dAmnX.notice('dAmnGoodies preferences were saved');
						DG.save();
					break;
					case 'load':
						DG.load();
						dAmnX.notice('dAmnGoodies preferences were loaded');
					break;
					case 'reinstall':
						window.setTimeout(function(){
						if(confirm('Would you like to install the newest version of dAmnGoodies?')){
							dAmnX.notice('Page will refresh automatically in 10 seconds');
							DG.reinstall();
						}
						}, 50);
					default:
						dAmnX.error('goodies', 'Unknown command. Try: load, save');
					break;
					}
				});
				
				dAmnX.command.bind('js', 1, function(args){
					var exec_js =  function(){
						var js = new Function('DX','DG', args);
						try{
							var result = js.call(DG, dAmnX, DG);
								dAmnX.notice((typeof JSON!='undefined'?JSON.stringify(result):unescape(result)));
						}catch(ex){
							dAmnX.error('js', ex);
						}
					}
					window.setTimeout(exec_js, 50);
				});
				
			});
			
			this.abbr = function(title, innerText){
				return "<abbr title=\""+title+"\">"+(innerText||'')+"</abbr>";
			}
			
			// Swap
			
			this.goodie('swap', {pairs: {'dAmnGoodies': ':thumb110193573:', 'https://': 'http://'}, enabled: true}, function(){
				dAmnX.command.bind('swap', 1, function(args){
					var a = args.split(" "),
						pairs = DG.goodies.pairs;
					switch(a[0]){
						case "on":
							DG.goodies.swap.enabled = true;
							DG.save();
							dAmnX.notice("Swapping enabled");
						break;
						case "off":
							DG.goodies.swap.enabled = false;
							DG.save();
							dAmnX.notice("Swapping disabled");
						break;
						case "get":
							var result = pairs[a[1]];
							if(result) dAmnX.notice(result);
							else dAmnX.notice(a[1]+' is not set');
						break;
						case "set":
							var result = args.slice(a[0].length+a[1].length+2);
							var str = a[1];
							if(a[1] == "{space}") a[1] = " ";
							DG.goodies.swap.pairs[a[1]] = result;
							DG.save();
							dAmnX.notice(a[1]+' => '+result);
						break;
						case "unset":
							if(a[1] == "{space}") a[1] = " ";
							delete DG.goodies.swap.pairs[a[1]];
							dAmnX.notice(a[1]+' is unset')
							DG.save();
						break;
						case "list":
							var msg = [];
							for(var it in DG.goodies.swap.pairs)
								msg.push(it);
							dAmnX.notice(msg.join(" "));
						break;
						case "clear":
							DG.goodies.swap.pairs = {};
							dAmnX.notice('Not swapping anything')
							DG.save();
						break;
						default:
							dAmnX.error('swap', 'Unknown command. Try: on, off, get, set, unset, list, clear');
						break;
					}
				});
				
				function escapeRegExp(str) {
				  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
				}
				
				dAmnX.before('send', function(body, done){
					var msg = body.str;
					if(DG.goodies.swap.enabled){
						for(var i in DG.goodies.swap.pairs){
							msg = msg.replace(new RegExp(escapeRegExp(i),'g'), DG.goodies.swap.pairs[i]);
						}
						body.str = msg;
					}
					done(body);
				})
			});
			
			// Nicknames
			this.goodie('nickname', {nicks: {}, enabled: true}, function(data){
				// Setup /nick command
				dAmnX.command.bind('nick', 1, function(args){
					var a = args.split(" ");
					switch(a[0]){
						case 'on':
						dAmnX.notice('Nicknames ON');
						DG.goodies.nickname.enabled = true;
						DG.save();
						break;
						case 'off':
						dAmnX.notice('Nicknames OFF');
						DG.goodies.nickname.enabled = false;
						DG.save();
						break;
						case 'get':
						var user = DG.goodies.nickname.nicks[a[1].toLowerCase()];
						dAmnX.notice(user?a[1]+' = '+user:"none")
						break;
						case 'set':
						var nick = a.length>3?args.slice(a[0].length+1+a[1].length+1):a[2];
						DG.goodies.nickname.nicks[a[1].toLowerCase()] = nick;
						DG.save();
						dAmnX.notice("Nickname for "+a[1]+" is set to "+nick);
						break;
						case 'unset':
						delete DG.goodies.nickname.nicks[a[1].toLowerCase()];
						DG.save();
						dAmnX.notice("Nickname for "+a[1]+" is unset");
						break;
						case 'list':
						var nicks = DG.goodies.nickname.nicks;
						var notice = [];
						for(var user in nicks) notice.push(user+"="+nicks[user]);
						dAmnX.notice(notice.length?notice.join("; "):"No nicknames are set");
						break;
						case 'clear':
						DG.goodies.nickname.nicks = {};
						dAmnX.notice("No nicknames are set");
						DG.save();
						default:
						dAmnX.error('nick', 'unknown command '+a[0]);
						break;
					}
				});
				
				dAmnX.before('send', function(body, done){
					var msg = " "+body.str+" ";
					
					if(DG.goodies.nickname.enabled){
						var nicks = DG.goodies.nickname.nicks;
						for(var nick in nicks){
							var reg = new RegExp('([ :,])'+nick+'([:]+)','gi'),
								match = reg.exec(msg);
							if(match)
								msg = msg.replace(reg, match[1]+DG.abbr(nick, nicks[nick])+(match[2]=="::"?"":match[2]));
						}
						
						body.str = msg.slice(1,-1);
					}
					
					done(body);
				})
				
				dAmnX.before('msg', function(body, done){
					if(DG.goodies.nickname.enabled){
						var b = body.pkt.body.split("\n");
						var from = b[1].split("=")[1],
							nick = DG.goodies.nickname.nicks[from.toLowerCase()];
						if(nick) b[1] = "from="+nick;
						body.pkt.body = b.join("\n");
					}
					done(body);
				});
				
				dAmnX.before('action', function(body, done){
					if(DG.goodies.nickname.enabled){
						var b = body.pkt.body.split("\n");
						var from = b[1].split("=")[1].toLowerCase(),
							nick = DG.goodies.nickname.nicks[from];
						if(nick) b[1] = "from="+nick;
						body.pkt.body = b.join("\n");
					}
					done(body);
				});
				
				dAmnX.before('event', function(body, done){
					if(DG.goodies.nickname.enabled){
						
						var nick = DG.goodies.nickname.nicks[body.pkt.param.toLowerCase()];
						if(nick) body.pkt.param = nick;
						nick = null;
						if(body.pkt.args && body.pkt.args.by)
							nick = DG.goodies.nickname.nicks[body.pkt.args.by.toLowerCase()];
						if(nick) body.pkt.args.by = nick;
					}
					done(body);
				});
				
				dAmnX.before('selfEvent', function(body, done){
					if(DG.goodies.nickname.enabled && body.ev == 'kicked'){
						var nick = DG.goodies.nickname.nicks[body.arg1.toLowerCase()]
						if(nick) body.arg1 = nick;
					}
					done(body);
				});
			});
			
			// Bob
			this.goodie('bob', {enabled: false}, function(){
								
				dAmnX.command.bind('bob', 0, function(){
					if(DG.goodies.bob.enabled){
						DG.goodies.bob.enabled = false;
						dAmnX.notice('No More Bob');
					}else{
						DG.goodies.bob.enabled = true;
						dAmnX.notice('BOB!');
					}
					DG.save();
				});
				
				dAmnX.before('msg', function(body, done){
					if(DG.goodies.bob.enabled){
						var b = body.pkt.body.split("\n");
						b[1] = "from=Bob";
						body.pkt.body = b.join("\n");
						console.log(body);
					}
					done(body);
				});
				
				dAmnX.before('action', function(body, done){
					if(DG.goodies.bob.enabled){
						var b = body.pkt.body.split("\n");
						b[1] = "from=Bob";
						body.pkt.body = b.join("\n");
					}
					done(body);
				});
				
				dAmnX.before('event', function(body, done){
					if(DG.goodies.bob.enabled){
						body.pkt.param = 'Bob';
						if(body.pkt.args)
							body.pkt.args.by = 'Bob';
					}
					done(body);
				});
				
				dAmnX.before('selfEvent', function(body, done){
					if(DG.goodies.bob.enabled && body.ev == 'kicked'){
						body.arg1 = 'Bob';
					}
					done(body);
				});
				
			});
			
			// Mimic
			this.goodie('mimic', {mimicking: [], enabled: true, announce: true}, function(data){

				dAmnX.command.bind('mimic', 1, function(args){
					var a = args.split(" ");
					var g = DG.goodies.mimic,
						list = g.mimicking;
						
					switch(a[0]){
						case "status":
							dAmnX.notice('Mimicking is '+(g.enabled?"enabled":"disabled"));
							break;
						case "announce":
							if(g.announce){
								dAmnX.notice('Announcements are turned OFF');
								g.announce = false;
							}else{
								dAmnX.notice('Announcements are turned ON. YEAH BABY!');
								g.announce = true;
							}
							DG.save();
							break;
						case "off":
							g.enabled = false;
							DG.save();
							dAmnX.notice('Mimic is enabled')
							break;
						case "on":
							g.enabled = true;
							DG.save();
							dAmnX.notice('Mimic is disabled')
							break;
						case "start":
							if(dAmn_Client_Username.toLowerCase() == a[1].toLowerCase()){
								dAmnX.error('mimic', 'You cannot mimic yourself');
							}
							else if(a[1].toLowerCase() == 'bob'){
								dAmnX.error('mimic', 'You cannot mimic Bob :-|');
							}
							else if(list.indexOf(a[1].toLowerCase())>-1) 
								dAmnX.error('mimic', 'You are already mimicking '+a[1]);
							else {
								DG.goodies.mimic.mimicking.push(a[1].toLowerCase());
								DG.save();
								dAmnX.notice('Started to mimic '+a[1])
								if(g.announce)
									dAmnX.send.action(false, 'started to mimic '+a[1]);
							}
							break;
						case "stop":
							if(list.indexOf(a[1].toLowerCase())==-1) 
								dAmnX.error('mimic', 'You are not mimicking '+a[1]);
							else {
								var l = [];
								DG.goodies.mimic.mimicking.each(function(u){ if(u != a[1].toLowerCase()) l.push(u); })
								DG.goodies.mimic.mimicking = l;
								DG.save();
								dAmnX.notice('Stopped mimicking '+a[1])
								if(g.announce)
									dAmnX.send.action(false, 'stopped mimicking '+a[1]);
							}
							break;
						case "list":
							dAmnX.notice('You mimic'+(list.length?": "+list.join(", "):' none'))
							break;
						case "clear":
							DG.goodies.mimic.mimicking = [];
							DG.save();
							if(g.announce)
								dAmnX.send.action(false, 'stopped mimicking everyone');
							dAmnX.notice('Not mimicking anyone')
							break;
						default:
							dAmnX.error('mimic', 'unknown command '+a[0]);
							break;
					}
					
				});
				
				dAmnX.after('msg', function(body, done){
					if(DG.goodies.mimic.enabled){
						var b = body.pkt.body.split("\n"),
							from = b[1].split("=")[1],
							msg = b[3];
						if(dAmn_Client_Username.toLowerCase() != from.toLowerCase() && DG.goodies.mimic.mimicking.indexOf(from.toLowerCase())>-1)
							dAmnX.send.msg(dAmnX.channelNs(), dAmnX.parseMsg(msg))
					}
					done(body);
				});
				
				dAmnX.after('action', function(body, done){
					if(DG.goodies.mimic.enabled){
						var b = body.pkt.body.split("\n"),
							from = b[1].split("=")[1],
							msg = b[3];
						if(dAmn_Client_Username != from && DG.goodies.mimic.mimicking.indexOf(from.toLowerCase())>-1)
							dAmnX.send.action(dAmnX.channelNs(), msg)
					}
					
					done(body);
				});
				
			});
			
			// klaT
			this.goodie('klat', {on: false}, function(){
								
				dAmnX.command.bind('klat', 0, function(){
					if(DG.goodies.klat.on){
						DG.goodies.klat.on = false;
						dAmnX.notice('Backward talking off');
					}else{
						DG.goodies.klat.on = true;
						dAmnX.notice('sdrawkcab klat ot emit stI');
					}
					DG.save();
				});
				
				dAmnX.before('send', function(body, done){
					if(DG.goodies.klat.on){
						if(body.cmd == 'msg' || body.cmd == 'action'){
							body.str = body.str.split("").reverse().join("");
						}
					}
					done(body);
				});
				
			});
			
			// Anti-kick
			this.goodie('antikick', {enabled: true}, function(){
								
				dAmnX.command.bind('antikick', 0, function(){
					if(DG.goodies.antikick.on){
						DG.goodies.antikick.on = false;
						dAmnX.notice('You can be kicked');
					}else{
						DG.goodies.antikick.on = true;
						dAmnX.notice('You will automatically return after you are kicked');
					}
					DG.save();
				});
				
				dAmnX.before('selfKicked', function(body, done){
					if(DG.goodies.antikick.on){
						dAmnX.send.join(body.self.ns);
					}
					done(body);
				});
				
			});
			
			// Multi
			this.goodie('multi', {}, function(){
				
				dAmnX.command.bind('global', 1, function(args){
					for(var ns in dAmnChatTabs)
						dAmnX.send.msg(ns, args)
				})
				
				dAmnX.command.bind('multi', 1, function(args){
					var a = args.split(' ');
					if(a.length == 1){
						dAmnX.error('multi', 'Supply more parameters')
						return;
					}
					
					var list, text, ns = dAmnX.channelNs();
					if(a[1][0]=="("){
						list = args.slice(args.indexOf("("));
						var endbrac = list.indexOf(")")
						list = list.slice(0,endbrac);
						text = list.slice(endbrac+2);
						list = (list == "")?[]:list.split(' ');
					}else{
						if(a[1] == "") list = [];
						else list = [a[1]];
						text = args.slice(a[0].length+1+a[1].length+1)
					}
					
					if(!list.length){
						dAmnX.error('multi', 'List empty')
						return;
					}
					
					function listOfUsernames(){
						var l = [];
						var mems = dAmnX.getChannel().members.members;
						list.each(function(user){
							if(user[0]=="*"){
								var privlev = user.slice(user[1]=="*"?2:1);
								for(var member in mems){
									if(mems[member].info.pc == privlev) l.push(member);
								}
							}else if(user=="{}"){
								for(var member in mems)
									l.push(member);
							}else{
								l.push(user);
							}
						});
						return l;
					}
					
					function listOfChannels(){
						var l = [];
						list.each(function(chan){
							if(chan == "{}"){
								for(var ns in dAmnChatTabs)
									l.push(ns);
							}
							else l.push(dAmnX.channelNs(chan));
						})
						list = l;
						return list;
					}
					
					var users = listOfUsernames();
					
					switch(a[0]){
						case 'msg':
						if(users.length)
							listOfChannels().each(function(chan){
								dAmnX.send.msg(chan, text)
							});
						break;
						case 'action':
						if(users.length)
							dAmnX.send.action(ns, users.join(", ")+" "+text);
						break;
						case 'ban':
						if(users.length)
							users.each(function(user){ dAmnX.send.ban(ns, user); });
						break;
						case 'clear':
						list.each(function(chan){
							chan = dAmnX.channelNs(chan);
							dAmnX.send.clear(chan);
						});
						break;
						case 'demote':
						if(users.length) users.each(function(user){
							dAmnX.send.demote(ns, user, text);
						});
						break;
						case 'display':
						if(users.length) dAmnX.notice(users.join(" "));
						break;
						case 'join':
						list.each(function(chan){
							chan = dAmnX.channelNs(chan);
							dAmnX.send.join(ns);
						});
						break;
						case 'kick':
						if(users.length) users.each(function(user){
							dAmnX.send.kick(ns, user, text);
						});
						break;
						case 'part':
						list.each(function(chan){
							chan = dAmnX.channelNs(chan);
							dAmnX.send.part(chan);
						});
						break;
						case 'promote':
						if(users.length) users.each(function(user){
							dAmnX.send.promote(ns, user, text);
						});
						break;
						case 'title':
						list.each(function(chan){
							chan = dAmnX.channelNs(chan);
							dAmnX.send.title(chan, text);
						});
						break;
						case 'topic':
						list.each(function(chan){
							chan = dAmnX.channelNs(chan);
							dAmnX.send.topic(chan, text);
						});
						break;
						case 'unban':
						if(users.length) users.each(function(user){
							dAmnX.send.unban(ns, user);
						});
						break;
						case 'whois': // ??
						if(users.length) users.each(function(user){
							dAmnX.send.whois(ns, user);
						});
						break;
					}
				});
				
				if(!$.jStorage) alert('No jStorage!');
				else this.save();
				
			})
			
			this.stripAbbrTags = function(str){
				str = str.replace( /<abbr title="(.*)">.*<\/abbr>/gi, '$1' );
				return str;
			}
			this.stripColorsTags = function(str){
				return str.replace(/colors:[a-zA-Z0-9]+:([a-zA-Z0-9])+/gi, "")
			}
			
			this.goodie('shun', {enabled: true, taunts: ["Shun!","Shuuuuunnnnnnn!!!!", "SHUN!!!", "S H U N !", "SSHHUUNN!!", "shun? :o", "SSHHHUUUUNNNNN!!!!!!", "SHUN", "SHUNSHUNSHUNSHUNSHUNSHUN", "shun :|", "SHHHHUUUUUUUNNNN","I SHUN YOU", "SHUN THE NON-BELIEVER!", "Shunday? :o"]}, function(){
				
				dAmnX.command.bind('shun', 0, function(args){
					if(!args || args == ''){
						DG.goodies.shun.enabled = DG.goodies.shun.enabled?false:true;
						dAmnX.notice('Shun is now '+(DG.goodies.shun.enabled?"ON":"OFF"))
						DG.save();
					}else{
						var shunned= args.split(" ")[0];
						if(shunned == "") dAmnX.error('shun', 'Noone to shun');
						else{
							dAmnX.send.action(false, 'shuns '+shunned);
						}
					}
				})
				
				dAmnX.before('action', function(body, done){
					var msg = DG.stripColorsTags(DG.stripAbbrTags(dAmnX.parseMsg(body.pkt.body.split("\n")[3])));
					if(DG.goodies.shun.enabled && msg.slice(0,6)=="shuns "){
						var shunned = msg.slice(6).split(" ")[0];
						if(shunned.length){
							var taunts = DG.goodies.shun.taunts;
							dAmnX.send.msg(body.self.ns, shunned+": "+(taunts[Math.floor(Math.random()*taunts.length)]||"SHUN"))
						}
					}
					done(body)
				});
			})
			
			// Safe message. Preserves original messages
			
			this.goodie('safe', {'keepSafe':0}, function(){
				dAmnX.command.bind('safe', 0, function(args){
					if(!args || args=='') args = 1
					else if(!isNaN(Number(args))) args = Math.abs(Number(args));
					else args = 1;
					DG.goodies.safe.keepSafe = args;
					dAmnX.notice(args==1?'The next message is safe':'The next '+args+' messages are safe')
				});
				
				dAmnX.before('send', function(body, done){
					if(DG.goodies.safe.keepSafe){
						body.str = body.str2;
						DG.goodies.safe.keepSafe--;
					}
					done(body);
				})
			})
			
		}
		
		
		var now = Date.now();
		(function waitForDamnX(){
			if(typeof dAmnX != 'undefined' && dAmnX.isReady) DG.init();
			else if(now + 15000 <= Date.now()){
				var install = confirm("dAmnGoodies requires the dAmnX userscript to operate. Click OK to install. ")
				if(install){
					var url = window.location.href;
					window.location = "http://github.com/SamM/dAmn/raw/master/dAmnX.user.js";
					//window.open('http://github.com/SamM/dAmn/raw/master/dAmnX.user.js', '_blank');
					window.setTimeout(function(){ window.location = url; }, 10000)
				}
			}
			else window.setTimeout(waitForDamnX, 50);
		})();
	};
	
	return new dAmnGoodies();
}

function execute_script(script, id){
	var el = document.createElement('script');
	if(id) el.id = id;
	el.appendChild(document.createTextNode(script));
	document.getElementsByTagName("head")[0].appendChild(el);
	return el;
}
if (typeof dAmnGoodies != 'undefined') alert("You have multiple versions of dAmnGoodies installed");
else execute_script("var dAmnGoodies = window.dAmnGoodies = ("+init.toString()+")();", "dAmnGoodies_Script")