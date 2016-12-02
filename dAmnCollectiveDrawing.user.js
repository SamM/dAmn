// ==UserScript==
// @name           dAmn Collective Drawing
// @description    Draw alongside other Deviants right from within dAmn
// @author         Sam Mulqueen <sammulqueen.nz@gmail.com>
// @version        0.0.3
// @include        http://chat.deviantart.com/chat/*
// ==/UserScript==

function DCDScript(){

  var dAmn = {};
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
        var event = {
          args: args,
          preventDefault: function(){
            prevent = true;
          },
          returnValue: undefined,
          after: function(returnValue){ return returnValue; }
        };
        dAmn.event.emit.apply(this, [method, event]);
        var methodReturn;
        if(!prevent){
          methodReturn = dAmn.original[method].apply(this, args);
          if(typeof event.after == "function"){
            event.after.call(this, methodReturn);
          }
        }
        return (typeof event.returnValue == "undefined")?methodReturn:event.returnValue;
      };
      var original = window;
      path.forEach(function(step, i){
        if(i == path.length-1){
          original[step] = dAmn.replaced[method];
        }
      });
      if(method.indexOf("dAmnChanChat.prototype.") == 0){
        dAmnChanMainChat.prototype[path[path.length-1]] = dAmn.replaced[method];
        var channels = dAmn.chat.chatrooms;
        for(var c in channels){
          channels[c].channels.main[path[path.length-1]] = dAmn.replaced[method];
        }
      }
    }
  }
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
    FormatMsg: "dAmnChanChat.prototype.FormatMsg"
  };

  for(var m in methods){
    dAmn.chat.events[m] = function(handler){
      return dAmn.event.listen(methods[m], handler);
    }
  }

  dAmn.chat.chatrooms = dAmnChats;
  dAmn.chat.tabs = dAmnChatTabs;
  dAmn.chat.stack = dAmnChatTabStack;
  dAmn.chat.getActive = function(returnChatroom){
    if(returnChatroom){
      return dAmn.chat.get(dAmnChatTab_active);
    }
    return dAmnChatTab_active;
  }
  dAmn.chat.get = function(ns){
    if(typeof ns == "undefined"){
      ns = dAmnChatTab_active;
    }
    return dAmn.chat.chatrooms[ns];
  }
  dAmn.chat.getTab = function(chatroom){
    if(typeof chatroom == "string"){
      return dAmn.chat.tabs[chatroom];
    }
    return dAmn.chat.tabs[dAmn.chat.getActive()];
  }
  
}

function execute_script(script, id){
	var el = document.createElement('script');
	if(id) el.id = id;
	el.appendChild(document.createTextNode(script));
	document.getElementsByTagName("head")[0].appendChild(el);
	return el;
}
execute_script("var DCD = window.DCD = ("+DCDScript.toString()+")();", "dAmnCollectiveDrawing_Script")
