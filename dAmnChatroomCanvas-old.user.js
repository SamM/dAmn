// ==UserScript==
// @name           dAmn Chatroom Canvas
// @description    Draw alongside other Deviants right from within dAmn
// @author         Sam Mulqueen <sammulqueen.nz@gmail.com>
// @version        1.1.0
// @include        http://chat.deviantart.com/chat/*
// ==/UserScript==

function dAmnHelperScript(){
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
              event.after.call(this, methodReturn);
            }
          }
          if(typeof this == "function"){
            return (typeof event.returnValue == "undefined") ? methodReturn : event.returnValue;
          }
        };
        if(["dAmnChat", "dAmnChanChat", "dAmnChanMainChat"].indexOf(method)>-1){
          dAmn.replaced[method].prototype = dAmn.original[method].prototype;
        }
        original = window;
        path.forEach(function(step, i){
          if(i == path.length-1){
            original[step] = dAmn.replaced[method];
          }
        });
        if(method.indexOf("dAmnChanChat.prototype.") === 0){
          dAmnChanMainChat.prototype[path[path.length-1]] = dAmn.replaced[method];
          var channels = dAmn.chat.chatrooms;
          for(var c in channels){
            channels[c].channels.main[path[path.length-1]] = dAmn.replaced[method];
          }
        }
        if(method.indexOf("dAmnChat.prototype.") === 0){
          dAmnChat.prototype[path[path.length-1]] = dAmn.replaced[method];
          var channels = dAmn.chat.chatrooms;
          for(var c in channels){
            channels[c][path[path.length-1]] = dAmn.replaced[method];
          }
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
      FormatMsg: "dAmnChanChat.prototype.FormatMsg"
    };

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
    dAmn.chat.getTitle = function(ns){
      var chatroom = dAmn.chat.get(ns);
      return chatroom.title_el.innerHTML;
    };
    dAmn.chat.getTopic = function(ns){
      var chatroom = dAmn.chat.get(ns);
      return chatroom.channels.main.topic_el.innerHTML;
    };
  }

  DWait.ready(['jms/pages/chat07/chatpage.js', 'jms/pages/chat07/dAmn.js', 'jms/pages/chat07/dAmnChat.js'], function() {
    SetupdAmn();
  });
  return dAmn;
}

function DCCScript(){
  var DCC = {};

  DCC.toggle = function(){
    var chatroom = dAmn.chat.get();
    ToggleChatroom.call(chatroom);
  };

  DCC.fade = function(alpha){
    var chatroom = dAmn.chat.get();
    FadeChatroom.call(chatroom,alpha);
  };

  function FadeChatroom(alpha){
    var body = this.lo_rf_el;
    var title = this.lo_rt_el;
    body.style.opacity = alpha;
    title.style.opacity = alpha;
  }

  function SetupCanvas(){
    var parent = this.room_el.parentNode;
    DCC.canvas = MakeCanvas(parent, 0);
    DCC.canvas.style.backgroundColor = "white";
    DCC.canvas.style.display = "none";
  }

  function SetupChatroom(){
    this.drawToggle = false;
    this.canvas = DCC.canvas;
    this.drawingSteps = [];
    this.drawSettings = {
      color: "#7F7F7F",
      lineWidth: 2,
      tool: "line"
    };
  }
  DCC.isDrawing = false;
  DCC.click = {x:0,y:0};
  DCC.move = {x:0, y:0};
  DCC.linePath = [];
  DCC.lineLimit = 100;
  DCC.isSetup = false;

  function HandleMouseDown(e){
    var chatroom = dAmn.chat.get();
    DCC.isDrawing = true;
    DCC.move.x = DCC.click.x = e.offsetX-Math.round(chatroom.canvas.width/2);
    DCC.move.y = DCC.click.y = e.offsetY-Math.round(chatroom.canvas.height/2);
    DCC.linePath = [];
    DCC.linePath.push([
      DCC.click.x,
      DCC.click.y
    ].join(","));
    Redraw.call(chatroom);
  }

  function HandleMouseUp(e){
    if(DCC.isDrawing){
      var chatroom = dAmn.chat.get();
      if(!hasEnableToken(chatroom)) return;
      var settings = chatroom.drawSettings;
      var color = settings.color;
      var x = DCC.click.x;
      var y = DCC.click.y;
      var endX = e.offsetX - Math.round(chatroom.canvas.width/2);
      var endY = e.offsetY - Math.round(chatroom.canvas.height/2);
      switch(settings.tool){
        case "circle":
          var radius = Math.round(Math.sqrt(Math.pow(x-endX,2) + Math.pow(y-endY,2)));
          if(radius === 0){
            radius = settings.lineWidth;
          }
          dAmn.send.action(chatroom.ns,
          "draws a circle in "+color
          +" of radius "+radius+" at "+x+","+y);
          break;
        case "rectangle":
          if(x==endX){
            endX = x+settings.lineWidth;
          }
          if(y==endY){
            endY = y+settings.lineWidth;
          }
          dAmn.send.action(chatroom.ns,
            "draws a rectangle in "+color
            +" from "+x+","+y+" to "+endX+","+endY);
          break;
        case "line":
          dAmn.send.action(chatroom.ns,
            "draws a line in "+color+" of width "+settings.lineWidth
            +" along <abbr title=\"("+DCC.linePath.join(";")+")\">"+DCC.linePath.length+" points</abbr>");
          break;
      }
    }
    DCC.isDrawing = false;
  }

  function underCharacterLimit(){
    return DCC.linePath.join(" ").length < 3000;
  }

  function HandleMouseMove(e){
    if(DCC.isDrawing){
      var chatroom = dAmn.chat.get();
      var settings = chatroom.drawSettings;
      DCC.move.x = e.offsetX-Math.round(chatroom.canvas.width/2);
      DCC.move.y = e.offsetY-Math.round(chatroom.canvas.height/2);
      switch(settings.tool){
        case "circle":
          break;
        case "rectangle":
          break;
        case "line":
          if(underCharacterLimit()){
            DCC.linePath.push([
              e.offsetX-Math.round(chatroom.canvas.width/2),
              e.offsetY-Math.round(chatroom.canvas.height/2)
            ].join(","));
          }
          break;
      }
      Redraw.call(chatroom);
    }
  }

  function MakeCanvas(parent, z){
    var canvas = document.createElement("canvas");
    parent.appendChild(canvas);
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.right = "0px";
    canvas.style.zIndex = z?z:0;
    canvas.onmouseup = HandleMouseUp;
    canvas.onmousedown = HandleMouseDown;
    canvas.onmousemove = HandleMouseMove;
    canvas.onclick = HandleMouseUp;
    return canvas;
  }

  function hasEnableToken(chatroom){
    var title = dAmn.chat.getTitle(chatroom.ns);
    if(title.toLowerCase().indexOf("(draw!)") > -1) return true;
    return false;
  }

  function ToggleChatroom(toggle){
    if(!hasEnableToken(this)) toggle = false;
    var room = this.room_el;
    var parent = room.parentNode;
    this.drawToggle = typeof toggle == "boolean"?toggle:!this.drawToggle;
    if(this.drawToggle){
      this.canvas.style.display = "block";
      Redraw.call(this);
      DCC.gui.update(true);
    }else{
      this.canvas.style.display = "none";
      room.style.width = "100%";
      DCC.gui.update(false);
    }
    this.onResize();

  }

  function toPoint(str){
    var args = str.split(",");
    return {x: parseInt(args[0]), y: parseInt(args[1])};
  }

  function drawCircle(context, x, y, radius, color){
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, 2*Math.PI);
    context.closePath();
    context.fill();
  }

  function drawRectangle(context, x,y,width,height, color){
    context.fillStyle = color;
    context.fillRect(x,y,width,height);
  }

  function drawLine(context, width, points, color){
    if(!points.length) return;
    context.lineWidth = width;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(points[0].x,points[0].y);
    for(var i=1; i<points.length; i++){
      context.lineTo(points[i].x, points[i].y);
    }
    context.stroke();
  }

  function drawStep(context, step){
    var args = step.split(";");
    var color = args[1];
    switch(args[0]){
      case "circle":
        var radius = parseInt(args[2]);
        var point = toPoint(args[3]);
        drawCircle(context, point.x, point.y, radius, color)
        break;
      case "rectangle":
        var from = toPoint(args[2]);
        var to = toPoint(args[3]);
        var width = to.x-from.x;
        var height = to.y-from.y;
        drawRectangle(context, from.x, from.y, width, height, color)
        break;
      case "line":
        var width = parseInt(args[2]);
        var points = [];
        for(var i=3; i<args.length; i++){
          points.push(toPoint(args[i]));
        }
        drawLine(context, width, points, color);
        break;
    }
  }
  function ResetSize(){
    var size = this.room_el.offsetHeight;
    this.canvas.width = size;
    this.canvas.height = size;
    this.room_el.style.width = this.drawToggle?(this.room_el.parentNode.offsetWidth - this.room_el.offsetHeight)+"px":"100%";
  }

  function Redraw(){
    if(!this.drawToggle) return;
    var steps = this.drawingSteps;
    var canvas = this.canvas;
    if(!canvas) return;
    var context = canvas.getContext("2d");
    ResetSize.call(this);
    context.clearRect(0,0,canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width/2, canvas.height/2);

    for(var i=0; i<steps.length; i++){
      drawStep(context, steps[i]);
    }

    if(DCC.isDrawing){
      var settings = this.drawSettings;
      var color = settings.color;
      var x = DCC.click.x;
      var y = DCC.click.y;
      var endX = DCC.move.x;
      var endY = DCC.move.y;
      switch(settings.tool){
        case "circle":
          var radius = Math.sqrt(Math.pow(x-endX,2) + Math.pow(y-endY,2));
          drawCircle(context, x, y, radius, color);
          break;
        case "rectangle":
          var width = endX-x;
          var height = endY-y;
          drawRectangle(context, x, y, width, height, color);
          break;
        case "line":
          if(underCharacterLimit()){
            var points = [];
            for(var i=0; i<DCC.linePath.length; i++){
              if(isPoint(DCC.linePath[i])){
                points.push(toPoint(DCC.linePath[i]));
              }
            }
            drawLine(context, settings.lineWidth, points, color);
          }
          break;
      }
    }
    context.restore();
  }

  function ClearDrawing(){
    this.drawingSteps = [];
    Redraw.call(this);
  }

  function isPoint(str){
    var split = str.split(",");
    if(split.length != 2) return false;
    if(isNaN(parseInt(split[0])) || isNaN(parseInt(split[1]))) return false;
    return true;
  }

  function ParseAction(user, msg){
    if(msg.indexOf("draws ") === 0){
      var str = msg.slice(6);
      var word = str.split(" ");
      var args = [];
      if(str.indexOf("a circle") === 0){
        args.push("circle");
        if(word[2] != "in") return;
        args.push(word[3]);
        if(word[4] == "of" && word[5] == "radius"){
          args.push(parseInt(word[6]));
          if(word[7] == "at"){
            if(!isPoint(word[8])) return;
            args.push(word[8]);
          }else{
            return;
          }
        }else{
          return;
        }
      }else if(str.indexOf("a rectangle") === 0){
        args.push("rectangle");
        if(word[2] != "in") return;
        args.push(word[3]);
        if(word[4] != "from" || word[6] != "to") return;
        if(!isPoint(word[5]) || !isPoint(word[7])) return;
        args.push(word[5]);
        args.push(word[7]);
      }else if(str.indexOf("a line") === 0){
        args.push("line");
        if(word[2] != "in") return;
        args.push(word[3]);
        if(word[4] == "of" && word[5] == "width"){
          args.push(word[6]);
          if(word[7] == "along"){
            var points_str = str.slice(str.indexOf("(")+1, str.indexOf(")"));
            var points_raw = points_str.split(";");
            for(var i = 0; i<points_raw.length; i++){
              if(!isPoint(points_raw[i])) return;
              args.push(points_raw[i]);
            }
          }else{
            return;
          }
        }else{
          return;
        }
      }
      if(args.length){
        this.drawingSteps.push(args.join(";"));
        Redraw.call(this);
      }
    }
  }

  function onEscapeToggle(e){
    if(e.keyCode == 27){
      ToggleChatroom.call(dAmn.chat.get());
    }
  }

  function SetupAll(){
    dAmn.chat.events.Clear(function(){
      if(DCC.isSetup && this.cr){
        var chatroom = dAmn.chat.get(this.cr.ns);
        ClearDrawing.call(chatroom);
      }
    });

    dAmn.event.listen("dAmnChat.prototype.onData", function(event){
      var pkt = event.args[0];
      var ns = this.ns;
      if(pkt.cmd=="property" && pkt.args.p == "title"){
        event.after = function(){
          if(!DCC.isSetup) return;
          var chatroom = dAmn.chat.get(ns);
          var found = dAmn.chat.getTitle(ns).toLowerCase().indexOf("(draw!)")>-1;
          ToggleChatroom.call(chatroom, found);
        };
      }
    });

    dAmn.chat.events.onAction(function(event){
      var user = event.args[0];
      var msg = event.args[1];
      if(this.cr){
        var ns = this.cr.ns;
        ParseAction.call(dAmn.chat.get(ns), user, msg);
      }
    });
    dAmn.event.listen("dAmnChat", function(event){
      if(!DCC.isSetup){
        SetupGUI();
      }
      event.after = function(){
        if(!DCC.canvas){
          SetupCanvas.call(this);
        }
        SetupChatroom.call(this);
        DCC.isSetup = true;
      };
    });

    dAmn.event.listen("dAmnChatTabs_activate", function(event){
      event.after=function(){
        var chatroom = dAmn.chat.get();
        ToggleChatroom.call(chatroom, chatroom.drawToggle);
      }
    });

    // When you press Esacpe, toggle between chat & drawing mode
    window.addEventListener("keyup", onEscapeToggle, false);

    var chatrooms = dAmn.chat.chatrooms;
    if(Object.keys(chatrooms).length){
      if(!DCC.isSetup){
        SetupGUI();
      }
      if(!DCC.canvas){
        SetupCanvas.call(this);
      }
      DCC.isSetup = true;
    }
    for(var c in chatrooms){
      SetupChatroom.call(chatrooms[c]);
    }
  }

  function SetupGUI(){
    DCC.gui = {};
    DCC.gui.el = document.createElement("div");
    DCC.gui.alignRight = function(){
      DCC.gui.el.style.float = "right";
    }
    DCC.gui.el.style.marginTop = "-7px";
    DCC.gui.alignRight();
    DCC.gui.parent = document.getElementsByClassName("tabbar")[0];
    DCC.gui.parent.appendChild(DCC.gui.el);
    DCC.gui.enabled = false;
    DCC.gui.update = function(enabled){
      var el = DCC.gui.el;
      if(typeof enabled == "undefined"){
        enabled = DCC.gui.enabled;
      }else{
        DCC.gui.enabled = enabled;
      }
      if(enabled){
        el.style.display = "block";
        el.innerHTML = "";
        var chatroom = dAmn.chat.get();
        if(!chatroom) return;
        var settings = chatroom.drawSettings;
        if(chatroom.drawToggle){
          var color_el = DCC.gui.makeElement("color", settings.color, function(){
            chatroom.drawSettings.color = this.value;
          });
          el.appendChild(color_el);
          if(settings.tool=="line"){
            var width_el = DCC.gui.makeElement("text", "", settings.lineWidth,
            function(){
              if(isNaN(parseInt(this.value))){
                this.value = chatroom.drawSettings.lineWidth;
              }else{
                chatroom.drawSettings.lineWidth = parseInt(this.value);
              }
            });
            el.appendChild(width_el);
          }
          var line_el = DCC.gui.makeElement("toggle", "Line", settings.tool=="line",
          function(value){
            chatroom.drawSettings.tool = "line";
            DCC.gui.update();
          });
          el.appendChild(line_el);
          var circle_el = DCC.gui.makeElement("toggle", "Circle", settings.tool=="circle",
          function(value){
            chatroom.drawSettings.tool = "circle";
            DCC.gui.update();
          });
          el.appendChild(circle_el);
          var rectangle_el = DCC.gui.makeElement("toggle", "Rectangle", settings.tool=="rectangle",
          function(value){
            chatroom.drawSettings.tool = "rectangle";
            DCC.gui.update();
          });
          el.appendChild(rectangle_el);

        }
      }else{
        DCC.gui.el.style.display = "none";
      }
    }
    DCC.gui.makeElement = function(type){
      var args = Array.prototype.slice.call(arguments, 1);
      var el = document.createElement('span');
      el.style.marginRight = "4px";
      el.style.padding = "3px 6px";
      switch(type){
        case "color":
          var color = args[0];
          var onChange = args[1];
          var input = document.createElement("input");
          input.type = "color";
          input.value = color;
          input.onchange = onChange;
          el.appendChild(input);
          break;
        case "text":
          var label = args[0];
          var value = args[1];
          var onChange = args[2];
          var input = document.createElement("input");
          input.type = "text";
          input.value = value;
          input.onchange = onChange;
          input.style.width = "50px";
          el.style.lineHeight = "1.5";
          el.innerHTML = label;
          el.appendChild(input);
          break;
        case "toggle":
          var text = args[0];
          var enabled = args[1];
          var onClick = args[2];
          el.onclick = onClick;
          el.innerHTML = text;
          el.style.backgroundColor = "rgba(255,255,255,0.2)";
          el.style.border = "1px solid rgba(255,255,255,0.4)";
          el.style.color = "white";
          el.style.padding = "3px 6px";
          if(enabled){
            el.style.border = "1px solid white";
            el.style.backgroundColor = "rgba(255,255,255,0.6)";
            el.style.fontWeight = "bold";
          }
          break;
      }
      return el;
    }
  }

  DWait.ready(['jms/pages/chat07/chatpage.js', 'jms/pages/chat07/dAmn.js', 'jms/pages/chat07/dAmnChat.js'], function() {
    SetupAll();
});

  return DCC;
}

function execute_script(script, id){
	var el = document.createElement('script');
	if(id) el.id = id;
	el.appendChild(document.createTextNode(script));
	document.getElementsByTagName("head")[0].appendChild(el);
	return el;
}
execute_script("var dAmn = window.dAmn = ("+dAmnHelperScript.toString()+")();",
"dAmnHelper_Script");
execute_script("var DCC = window.DCC = ("+DCCScript.toString()+")();", "dAmnCollectiveDrawing_Script");
