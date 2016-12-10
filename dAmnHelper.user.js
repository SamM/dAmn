// ==UserScript==
// @name           dAmn Helper Script
// @description    Helps write userscripts that modify dAmn
// @author         Sam Mulqueen <sammulqueen.nz@gmail.com>
// @version        0.5.0
// @include        http://chat.deviantart.com/chat/*
// ==/UserScript==

function dAmnHelper_Script(){
  var dAmn = {};
  function SetupdAmn(){
    window.dAmn = dAmn;

    dAmn.original = {};
    dAmn.replaced = {};

    dAmn.event = {};
    dAmn.event.hook = function(method){
      var original = window;
      var path = method.split(".");
      path.forEach(function(step){
        original = original[step];
      });
      if(typeof original == "function" && typeof dAmn.replaced[method] == "undefined"){
        dAmn.original[method] = original;
        dAmn.replaced[method] = function(){
          var args = Array.prototype.slice.call(arguments);
          var prevent = false;
          var after_calls = [];
          var event = {
            args: args,
            preventDefault: function(){
              prevent = true;
            },
            returnValue: undefined,
            after: function(fn){
              if(typeof fn == "function"){
                after_calls.push(fn);
              }
            }
          };
          dAmn.event.emit.apply(this, [method, event]);
          var methodReturn;
          if(!prevent){
            if(typeof this == "function"){
              methodReturn = dAmn.original[method].apply(this, args);
            }else{
              if(path[1] == "prototype"){
                methodReturn = dAmn.original[method].apply(this, args);
              }else{
                methodReturn = new dAmn.original[method](args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
                for(var attr in methodReturn){
                  this[attr] = methodReturn[attr];
                }
              }
            }
            if(typeof event.after == "function"){
              after_calls.forEach(function(fn){
                fn.call(this, methodReturn);
              });
            }
          }
          if(typeof this == "function" || path[1] == "prototype"){
            return (typeof event.returnValue == "undefined") ? methodReturn : event.returnValue;
          }
        };
        if(["dAmnChat", "dAmnChanChat", "dAmnChanMainChat", "dAmnChatInput"].indexOf(method)>-1){
          dAmn.replaced[method].prototype = dAmn.original[method].prototype;
        }
        original = window;
        path.forEach(function(step, i){
          if(i == path.length-1){
            original[step] = dAmn.replaced[method];
          }else{
            original = original[step];
          }
        });
        if(method.indexOf("dAmnChanChat.prototype.") === 0){
          dAmnChanMainChat.prototype[path[path.length-1]] = dAmn.replaced[method];
          dAmn.chat.forEach(function(chatroom){
            chatroom.channels.main[path[path.length-1]] = dAmn.replaced[method];
          })
        }
        if(method.indexOf("dAmnChatInput.prototype.") === 0){
          dAmn.chat.forEach(function(chatroom){
            chatroom.channels.main.input[path[path.length-1]] = dAmn.replaced[method];
          })
        }
        if(method.indexOf("dAmnChat.prototype.") === 0){
          dAmn.chat.forEach(function(chatroom){
            chatroom[path[path.length-1]] = dAmn.replaced[method];
          })
        }
      }
    };
    dAmn.event.listeners = {};
    dAmn.event.emit = function(method){
      if(Array.isArray(dAmn.event.listeners[method])){
        var args = Array.prototype.slice.call(arguments, 1);
        var listeners = dAmn.event.listeners[method];
        for(var i=0; i<listeners.length; i++){
          listeners[i].apply(this, args);
        }
      }
    };
    dAmn.event.listen = function(method, handler){
      if(!Array.isArray(dAmn.event.listeners[method])){
        dAmn.event.listeners[method] = [];
      }
      dAmn.event.hook(method);
      dAmn.event.listeners[method].push(handler);
    };

    dAmn.chat = {};
    dAmn.chat.events = {};
    var methods = {
      onMsg: "dAmnChanChat.prototype.onMsg",
      onAction: "dAmnChanChat.prototype.onAction",
      onResize: "dAmnChanChat.prototype.onResize",
      Clear: "dAmnChanChat.prototype.Clear",
      onSmileyClick: "dAmnChanChat.prototype.onSmileyClick",
      onSmiley: "dAmnChanChat.prototype.onSmiley",
      takeFocus: "dAmnChanChat.prototype.takeFocus",
      setTopic: "dAmnChanChat.prototype.setTopic",
      makeText: "dAmnChanChat.prototype.makeText",
      FormatMsg: "dAmnChanChat.prototype.FormatMsg",
      Send: "dAmnChat.prototype.Send"
    };

    dAmn.command = function(name, argsRequired, onCommand){
      if(typeof onCommand != "function"){
        throw "dAmn.command: onCommand must be a function";
      }
      if(typeof name != "string"){
        throw "dAmn.command: name must be a string"
      }
      name = name.toLowerCase();
      argsRequired = argsRequired?1:0;

      dAmn.event.listen("dAmnChatInput", function(event){
        event.after(function(input){
          input.cmds[name] = [argsRequired];
        });
      });

      dAmn.chat.forEach(function(chatroom){
        chatroom.channels.main.input.cmds[name] = [argsRequired];
      });

      function resetHistory(el){
        if (this.history_pos != -1  && this.history[this.history_pos] == el.value) { // posting from history.. move to the end
          var before = this.history.slice(0,this.history_pos);
          var after  = this.history.slice(this.history_pos+1);
          this.history = before.concat(after).concat( this.history[this.history_pos] );
        } else {
          // add to history -- limit to 300
          this.history = this.history.concat( el.value );
          if( this.history.length > 300 )
            this.history = this.history.slice(1);
        }
        this.history_pos = -1;
      }

      dAmn.event.listen("dAmnChatInput.prototype.onKey", function(event){
        var e = event.args[0];
        var kc = event.args[1];
        var force = event.args[2];
        var el = this.chatinput_el;
        if(kc == 13 && ( force || !this.multiline || e.shiftKey || e.ctrlKey )){
          if(el.value){
            if(!(e.shiftKey || (!this.multiline && e.ctrlKey))){
              var cmdre = el.value.match( /^\/([a-z]+)([\s\S]*)/m );
              if(!cmdre){
                return;
              }
              var cmd  = cmdre[1].toLowerCase();
              var args = null;
              if (cmdre[2]) {
                var tmp = cmdre[2].match(/^\s([\s\S]*)/);
                if( tmp && tmp.length )
                  args = tmp[1];
              }
              if(cmd == name){
                dAmnChatTabs_activate( this.cr.ns, true );
                delete this.tablist;
                resetHistory.call(this, el);
                if(this.cmds[cmd][0]) {
                  if (!args) {
                    this.cr.channels.main.onErrorEvent( cmd, 'insufficient parameters' );
                  }else{
                    onCommand(args);
                  }
                }else{
                  onCommand(args);
                }
                el.value='';
                el.focus();
                event.preventDefault();
                event.returnValue = false;
              }
            }
          }
        }
      });
    }

    dAmn.send = {};
    dAmn.send.msg = function(ns, text){
      var chatroom = dAmn.chat.get(ns);
      if(chatroom && chatroom.Send){
        chatroom.Send("msg", "main", text);
      }
    };
    dAmn.send.action = function(ns, text){
      var chatroom = dAmn.chat.get(ns);
      if(chatroom && chatroom.Send){
        chatroom.Send("action", "main", text);
      }
    };
    dAmn.send.join = function(ns){
      dAmn_Join(ns);
    }

    for(var m in methods){
      dAmn.chat.events[m] = (function(method){
        return function(handler){
          return dAmn.event.listen(method, handler);
        };
      })(methods[m]);
    }

    dAmn.chat.chatrooms = dAmnChats;
    dAmn.chat.tabs = dAmnChatTabs;
    dAmn.chat.stack = dAmnChatTabStack;
    dAmn.chat.getActive = function(returnChatroom){
      if(returnChatroom){
        return dAmn.chat.get(dAmnChatTab_active);
      }
      return dAmnChatTab_active;
    };
    dAmn.chat.get = function(ns){
      if(typeof ns != "string"){
        ns = dAmnChatTab_active;
      }
      return dAmn.chat.chatrooms[ns];
    };
    dAmn.chat.getTab = function(chatroom){
      if(typeof chatroom == "string"){
        return dAmn.chat.tabs[chatroom];
      }
      return dAmn.chat.tabs[dAmn.chat.getActive()];
    };
    dAmn.chat.forEach = function(fn){
      if(typeof fn != "function") return;
      for(var c in dAmn.chat.chatrooms){
        fn.call(dAmn.chat.chatrooms[c], dAmn.chat.chatrooms[c], c);
      }
    };
    dAmn.chat.getTitle = function(ns){
      var chatroom = dAmn.chat.get(ns);
      return chatroom.title_el.innerHTML;
    };
    dAmn.chat.getTopic = function(ns){
      var chatroom = dAmn.chat.get(ns);
      return chatroom.channels.main.topic_el.innerHTML;
    };
    dAmn.chat.notice = function(str, timeout, spanClass){
      var chatroom = dAmn.chat.get();
      spanClass = spanClass?spanClass:"";
      dAmn_addTimedDiv( chatroom.channels.main.error_el, "damn-error "+spanClass, str, timeout );
    }
    dAmn.chat.activate = function(ns){
      dAmnChatTabs_activate(ns);
    }
  }

  DWait.ready(['jms/pages/chat07/chatpage.js', 'jms/pages/chat07/dAmn.js', 'jms/pages/chat07/dAmnChat.js'], function() {
    SetupdAmn();
  });
}

function execute_script(script, id){
	var el = document.createElement('script');
	if(id) el.id = id;
	el.appendChild(document.createTextNode(script));
	document.getElementsByTagName("head")[0].appendChild(el);
	return el;
}

execute_script("("+dAmnHelper_Script.toString()+")();", "dAmnHelper_Script");
