// ==UserScript==
// @name           dAmn Chatroom Canvas
// @description    Draw alongside other Deviants right from within dAmn
// @author         Sam Mulqueen <sammulqueen.nz@gmail.com>
// @version        1.7.1
// @include        http://chat.deviantart.com/chat/*
// ==/UserScript==

function CCScript(){

  var CC = {};
  window.CC = CC;
  CC.isSetup = false;
  CC.isDrawing = false;
  CC.isToggled = false;

  CC.screenWidth = document.body.offsetWidth;

  CC.drawings = {};

  CC.createCanvas = function(){
    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = CC.screenWidth;
    return canvas;
  };

  CC.drawing = {};
  CC.drawing.canvas = null;
  CC.drawing.isToggled = false;
  CC.drawing.isFullscreen = false;
  CC.drawing.setup = function(){
    if(CC.drawing.canvas) return;
    var canvas = document.createElement("canvas");
    canvas.style.backgroundColor = "white";
    canvas.style.display = "none";
    canvas.style.position = "absolute";
    canvas.style.cursor = "pointer";
    canvas.style.top = "0px";
    canvas.style.right = "0px";
    canvas.onmouseup = CC.mouse.onUp;
    document.onmouseup = CC.mouse.onUpDoc;
    canvas.onmousedown = CC.mouse.onDown;
    canvas.onmousemove = CC.mouse.onMove;
    canvas.onclick = CC.mouse.onUp;
    CC.drawing.canvas = canvas;
    var chatroom = dAmn.chat.get();
    var room_parent = chatroom.room_el.parentNode;
    room_parent.appendChild(canvas);
  };
  CC.drawing.toggle = function(enable){
    if(!CC.drawing.canvas) return;
    if(!arguments.length){
      enable = !CC.drawing.isToggled;
    }
    CC.drawing.isToggled = enable;
    CC.drawing.canvas.style.display = enable?"block":"none";
  };
  CC.drawing.resize = function(width, height){
    if(!arguments.length){
      var chatroom = dAmn.chat.get();
      var width = chatroom.room_el.parentNode.offsetWidth;
      var height = chatroom.room_el.parentNode.offsetHeight;
      if(!CC.drawing.isFullscreen){
        width = height;
      }
    }
    var canvas = CC.drawing.canvas;
    canvas.width = width;
    canvas.height = height;
  };
  CC.drawing.clear = function(ns){
    if(!ns){
      ns = dAmn.chat.getActive();
    }
    ns = ns.toLowerCase();
    CC.drawings[ns] = CC.createCanvas();
    CC.draw.drawing(ns);
  };

  CC.home = {};
  CC.home.ns = "chat:chatroomcanvas";
  CC.home.chatroom = null;
  CC.home.hasJoined = false;
  CC.home.autojoin = true;
  CC.home.wasClosed = false;

  CC.draw = {};
  CC.draw.settings = {};
  CC.draw.settings.default = {
    color: "#7F7F7F",
    lineWidth: 1,
    tool: "line"
  };
  CC.draw.tempLine = [];
  CC.draw.linePointsDrawn = 0;

  CC.chatroom = {};
  CC.chatroom.isToggled = true;
  CC.chatroom.setup = function(chatroom){
    chatroom = chatroom ? chatroom : dAmn.chat.get();
    if(!chatroom) return;
    ns = chatroom.ns.toLowerCase();
    CC.drawings[ns] = CC.drawings[ns]?CC.drawings[ns]:CC.createCanvas();
    var defaultSettings = CC.draw.settings.default;
    CC.draw.settings[ns] = CC.draw.settings[ns]?CC.draw.settings[ns]:{
      color: defaultSettings.color,
      lineWidth: defaultSettings.lineWidth,
      tool: defaultSettings.tool
    };
    chatroom.room_el.style.width = "auto";
    chatroom.room_el.style.left = "0px";
    chatroom.room_el.style.right = "0px";
  };
  CC.chatroom.resize = function(offset){
    var chatroom = dAmn.chat.get();
    if(!chatroom) return;
    if(typeof offset == "undefined"){
      offset = CC.chatroom.isToggled?0:chatroom.room_el.parentNode.offsetHeight;
    }
    function fixScroll(chan){
      setTimeout(function(){
        chan.scroll_el.scrollTop = chan.scroll_el.scrollHeight;
      }, 100);
    }
    for(var ns in dAmn.chat.chatrooms){
      var cr = dAmn.chat.chatrooms[ns];
      cr.room_el.style.display = "block";
      if(CC.chatroom.isHidden){
        cr.room_el.style.display = "none";
      }else{
        cr.room_el.style.right = offset+"px";
      }
      var chan = cr.channels.main;
      fixScroll(chan);
    }
  };
  CC.chatroom.toggle = function(enable){
    var chatroom = dAmn.chat.get();
    if(!chatroom) return;
    if(!arguments.length){
      enable = !CC.chatroom.isToggled;
    }
    CC.chatroom.isToggled = enable;
    CC.chatroom.resize();
  };

  CC.mouse = {};
  CC.mouse.click = {x:0,y:0};
  CC.mouse.position = {x:0,y:0};
  CC.mouse.onUpDoc = function(e){
    var chatroom = dAmn.chat.get();
    if(CC.isDrawing){
      var canvas = CC.drawing.canvas;
      var channel = chatroom.ns.split(":")[1];
      var settings = CC.draw.settings[chatroom.ns.toLowerCase()];
      var color = settings.color;
      var x = CC.mouse.click.x;
      var y = CC.mouse.click.y;
      var endX = CC.mouse.position.x;
      var endY = CC.mouse.position.y;
      switch(settings.tool){
        case "circle":
          var radius = Math.round(Math.sqrt(Math.pow(x-endX,2) + Math.pow(y-endY,2)));
          if(radius === 0){
            radius = settings.lineWidth;
          }
          dAmn.send.action(CC.home.ns,
          "draws in #"+channel+": a circle in "+color+" of radius "+radius+" at "+x+","+y);
          break;
        case "rectangle":
          if(x==endX){
            endX = x+settings.lineWidth;
          }
          if(y==endY){
            endY = y+settings.lineWidth;
          }
          dAmn.send.action(CC.home.ns,
            "draws in #"+channel+": a rectangle in "+color+" from "+x+","+y+" to "+endX+","+endY);
          break;
        case "line":
          if(CC.draw.tempLine.length-CC.draw.linePointsDrawn>0){
            var index = CC.draw.linePointsDrawn;
            index = index == 0?0:index-1;
            var segment = CC.draw.tempLine.slice(index);
            dAmn.send.action(CC.home.ns,
              "draws in #"+channel+": a line in "+color+" of width "+settings.lineWidth+" along <abbr title=\"("+segment.join(";")+")\">"+segment.length+" point"+(segment.length==1?"":"s")+"</abbr>");
          }
          CC.draw.linePointsDrawn = 0;
          CC.draw.tempLine = [];
          break;
      }
    }
    CC.isDrawing = false;
  };
  CC.onInterval = function(){
    if(CC.isDrawing){
      var ns = dAmn.chat.getActive();
      var settings = CC.draw.settings[ns.toLowerCase()];
      var channel = ns.split(":")[1];
      if(settings.tool == "line" && CC.draw.tempLine.length-CC.draw.linePointsDrawn>2){
        var index = CC.draw.linePointsDrawn;
        index = index == 0?0:index-1;
        var segment = CC.draw.tempLine.slice(index);
        dAmn.send.action(CC.home.ns,
          "draws in #"+channel+": a line in "+settings.color+" of width "+settings.lineWidth+" along <abbr title=\"("+segment.join(";")+")\">"+segment.length+" point"+(segment.length==1?"":"s")+"</abbr>");
        CC.draw.linePointsDrawn += segment.length-1;
      }
    }
  };
  CC.mouse.onUp = function(e){
    var chatroom = dAmn.chat.get();
    if(CC.isDrawing){
      var canvas = CC.drawing.canvas;
      var channel = chatroom.ns.split(":")[1];
      var settings = CC.draw.settings[chatroom.ns.toLowerCase()];
      var color = settings.color;
      var x = CC.mouse.click.x;
      var y = CC.mouse.click.y;
      var endX = CC.mouse.position.x = e.offsetX - Math.round(canvas.width/2);
      var endY = CC.mouse.position.y = e.offsetY - Math.round(canvas.height/2);
      switch(settings.tool){
        case "circle":
          var radius = Math.round(Math.sqrt(Math.pow(x-endX,2) + Math.pow(y-endY,2)));
          if(radius === 0){
            radius = settings.lineWidth;
          }
          dAmn.send.action(CC.home.ns,
          "draws in #"+channel+": a circle in "+color+" of radius "+radius+" at "+x+","+y);
          break;
        case "rectangle":
          if(x==endX){
            endX = x+settings.lineWidth;
          }
          if(y==endY){
            endY = y+settings.lineWidth;
          }
          dAmn.send.action(CC.home.ns,
            "draws in #"+channel+": a rectangle in "+color+" from "+x+","+y+" to "+endX+","+endY);
          break;
        case "line":
          if(CC.draw.tempLine.length-CC.draw.linePointsDrawn>0){
            var index = CC.draw.linePointsDrawn;
            index = index == 0?0:index-1;
            var segment = CC.draw.tempLine.slice(index);
            dAmn.send.action(CC.home.ns,
              "draws in #"+channel+": a line in "+color+" of width "+settings.lineWidth+" along <abbr title=\"("+segment.join(";")+")\">"+segment.length+" point"+(segment.length==1?"":"s")+"</abbr>");
          }
          CC.draw.linePointsDrawn = 0;
          CC.draw.tempLine = [];
        break;
      }
    }
    CC.isDrawing = false;
  };

  CC.mouse.onDown = function(e){
    var chatroom = dAmn.chat.get();
    var canvas = CC.drawing.canvas;
    CC.isDrawing = true;
    CC.mouse.position.x = CC.mouse.click.x = e.offsetX-Math.round(canvas.width/2);
    CC.mouse.position.y = CC.mouse.click.y = e.offsetY-Math.round(canvas.height/2);
    CC.draw.tempLine = [];
    CC.draw.linePointsDrawn = 0;
    CC.draw.tempLine.push([
      CC.mouse.click.x,
      CC.mouse.click.y
    ].join(","));
    CC.draw.drawing(chatroom.ns);
  };

  CC.underCharacterLimit = function(){
    return CC.draw.tempLine.join(" ").length < 3000;
  };

  CC.mouse.onMove = function(e){
    var canvas = CC.drawing.canvas;
    CC.mouse.position.x = e.offsetX-Math.round(canvas.width/2);
    CC.mouse.position.y = e.offsetY-Math.round(canvas.height/2);
    if(CC.isDrawing){
      var chatroom = dAmn.chat.get();
      var settings = CC.draw.settings[chatroom.ns.toLowerCase()];
      if(settings.tool == "line" && CC.draw.tempLine.length < 300){
        CC.draw.tempLine.push([
          e.offsetX-Math.round(canvas.width/2),
          e.offsetY-Math.round(canvas.height/2)
        ].join(","));
      }
      CC.draw.drawing(chatroom.ns);
    }
  };

  CC.resize = function(){
    CC.drawing.resize();
    CC.chatroom.resize();
  };

  CC.draw.drawing = function(ns){
    ns = ns.toLowerCase();
    // Only redraw if redraw is being requested for active chatroom
    if(ns == dAmn.chat.getActive().toLowerCase()){
      var canvas = CC.drawings[ns];
      if(!canvas) return;
      var workingCanvas = CC.drawing.canvas;
      if(!workingCanvas) return;

      var workingContext = workingCanvas.getContext("2d");
      CC.resize();
      workingContext.clearRect(0,0,workingCanvas.width, workingCanvas.height);

      // Draw canvas on to workingCanvas
      workingContext.save();
      workingContext.translate(Math.round(workingCanvas.width/2 - canvas.width/2), Math.round(workingCanvas.height/2 - canvas.height/2));
      workingContext.drawImage(canvas, 0, 0);
      workingContext.restore();

      workingContext.save();
      workingContext.translate(Math.round(workingCanvas.width/2), Math.round(workingCanvas.height/2));

      if(CC.isDrawing){
        var settings = CC.draw.settings[ns];
        if(!settings){
          settings = CC.draw.settings.default;
        }
        var color = settings.color;
        var x = CC.mouse.click.x;
        var y = CC.mouse.click.y;
        var endX = CC.mouse.position.x;
        var endY = CC.mouse.position.y;
        switch(settings.tool){
          case "circle":
            var radius = Math.sqrt(Math.pow(x-endX,2) + Math.pow(y-endY,2));
            CC.draw.circle(workingContext, x, y, radius, color);
            break;
          case "rectangle":
            var width = endX-x;
            var height = endY-y;
            CC.draw.rectangle(workingContext, x, y, width, height, color);
            break;
          case "line":
            if(CC.underCharacterLimit()){
              var points = [];
              for(i=0; i<CC.draw.tempLine.length; i++){
                if(CC.isPoint(CC.draw.tempLine[i])){
                  points.push(CC.toPoint(CC.draw.tempLine[i]));
                }
              }
              CC.draw.line(workingContext, settings.lineWidth, points, color);
            }
            break;
        }
      }
      workingContext.restore();
    }
  };

  CC.draw.step = function(context, step){
    var args = step.split(";");
    var color = args[1];
    var width;
    switch(args[0]){
      case "circle":
        var radius = parseInt(args[2]);
        var point = CC.toPoint(args[3]);
        CC.draw.circle(context, point.x, point.y, radius, color);
        break;
      case "rectangle":
        var from = CC.toPoint(args[2]);
        var to = CC.toPoint(args[3]);
        width = to.x-from.x;
        var height = to.y-from.y;
        CC.draw.rectangle(context, from.x, from.y, width, height, color);
        break;
      case "line":
        width = parseInt(args[2]);
        var points = [];
        for(var i=3; i<args.length; i++){
          points.push(CC.toPoint(args[i]));
        }
        CC.draw.line(context, width, points, color);
        break;
    }
  };

  CC.draw.rectangle = function(context, x,y,width,height, color){
    context.fillStyle = color;
    context.fillRect(x,y,width,height);
  };

  CC.draw.line = function(context, width, points, color){
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
  };

  CC.draw.circle = function(context, x, y, radius, color){
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, 2*Math.PI);
    context.closePath();
    context.fill();
  };

  CC.isPoint = function(str){
    var split = str.split(",");
    if(split.length != 2) return false;
    if(isNaN(parseInt(split[0])) || isNaN(parseInt(split[1]))) return false;
    return true;
  };

  CC.toPoint = function(str){
    var args = str.split(",");
    return {x: parseInt(args[0]), y: parseInt(args[1])};
  };

  CC.parseAction = function(user, msg){
    if(msg.indexOf("draws in #") !== 0) return;
    // Action starts with "draws in #"
    var str = msg.slice("draws in #".length);
    var word = str.split(" ");
    // Chatroom NS is "chat:" + first word in lowercase without trailing ":"
    var ns = "chat:"+word.shift().toLowerCase().slice(0,-1);
    if(!CC.drawings[ns]){
      // Create new array to store drawing instructions for this new chatroom
      CC.drawings[ns] = CC.createCanvas();
    }
    var args = [];
    if(word[0] != "a") return;
    if(word[1] == "circle"){
      args.push("circle");
      if(word[2] != "in") return;
      args.push(word[3]);
      if(word[4] == "of" && word[5] == "radius"){
        args.push(parseInt(word[6]));
        if(word[7] == "at"){
          if(!CC.isPoint(word[8])) return;
          args.push(word[8]);
        }else{
          return;
        }
      }else{
        return;
      }
    }else if(word[1] == "rectangle"){
      args.push("rectangle");
      if(word[2] != "in") return;
      args.push(word[3]);
      if(word[4] != "from" || word[6] != "to") return;
      if(!CC.isPoint(word[5]) || !CC.isPoint(word[7])) return;
      args.push(word[5]);
      args.push(word[7]);
    }else if(word[1] == "line"){
      args.push("line");
      if(word[2] != "in") return;
      args.push(word[3]);
      if(word[4] == "of" && word[5] == "width"){
        args.push(word[6]);
        if(word[7] == "along"){
          var points_str = str.slice(str.indexOf("(")+1, str.indexOf(")"));
          var points_raw = points_str.split(";");
          for(var i = 0; i<points_raw.length; i++){
            if(!CC.isPoint(points_raw[i])) return;
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
      // Add drawing instructions to list of the specified chatroom
      //CC.drawings[ns].push(args.join(";"));
      var canvas = CC.drawings[ns];
      var context = canvas.getContext("2d");

      context.save();
      context.translate(Math.round(canvas.width/2), Math.round(canvas.height/2));
      CC.draw.step(context, args.join(";"));
      context.restore();

      CC.draw.drawing(ns);
    }
  };

  CC.toggle = function(enable){
    if(!arguments.length){
      enable = !CC.isToggled;
    }
    if(!CC.home.hasJoined){
      enable = false;
    }
    CC.isToggled = enable;
    CC.drawing.toggle(enable);
    CC.chatroom.toggle(!enable);
    CC.gui.update(enable);
    dAmn_InvalidateLayout();
  };

  CC.onEscapeToggle = function(e){
    if(e.keyCode == 27){
      var chatroom = dAmn.chat.get();
      if(CC.isToggled){
        if(CC.drawing.isFullscreen){
          CC.drawing.isFullscreen = false;
          CC.chatroom.isHidden = false;
          CC.toggle(false);
        }else{
          CC.drawing.isFullscreen = true;
          CC.chatroom.isHidden = true;
          CC.toggle(true);
          CC.draw.drawing(chatroom.ns);
        }
      }else{
        CC.drawing.isFullscreen = false;
        CC.chatroom.isHidden = false;
        CC.toggle(true);
        CC.draw.drawing(chatroom.ns);
      }
    }
  };

  CC.gui = {};
  CC.gui.enabled = false;
  CC.gui.isSetup = false;
  CC.gui.setup = function(){
    if(CC.gui.isSetup) return;
    CC.gui.el = document.createElement("div");
    CC.gui.el.style.marginTop = "-7px";
    CC.gui.el.style.marginRight = "30px"; // Incase superdAmn is installed
    CC.gui.el.style.float = "right";
    CC.gui.el.style.display = "none";
    CC.gui.parent = document.getElementsByClassName("tabbar")[0];
    CC.gui.parent.appendChild(CC.gui.el);
    CC.gui.isSetup = true;
  };
  CC.gui.update = function(enabled){
    if(!CC.gui.isSetup){
      CC.gui.setup();
    }
    var el = CC.gui.el;
    if(typeof enabled == "undefined"){
      enabled = CC.gui.enabled;
    }else{
      CC.gui.enabled = enabled;
    }
    if(enabled){
      el.style.display = "block";
      el.innerHTML = "";
      var chatroom = dAmn.chat.get();
      if(!chatroom) return;
      var ns = chatroom.ns.toLowerCase();
      if(CC.isToggled){
        var settings = CC.draw.settings[ns];
        if(!settings){
          settings = CC.draw.settings.default;
        }
        var color_el = CC.gui.makeElement("color", settings.color, function(){
          CC.draw.settings[ns].color = this.value;
        });
        el.appendChild(color_el);
        if(settings.tool=="line"){
          var width_el = CC.gui.makeElement("text", "", settings.lineWidth,
          function(){
            if(isNaN(parseInt(this.value))){
              this.value = CC.draw.settings[ns].lineWidth;
            }else{
              CC.draw.settings[ns].lineWidth = parseInt(this.value);
            }
          });
          el.appendChild(width_el);
        }
        var line_el = CC.gui.makeElement("toggle", "Line", settings.tool=="line",
        function(value){
          CC.draw.settings[ns].tool = "line";
          CC.gui.update();
        });
        el.appendChild(line_el);
        var circle_el = CC.gui.makeElement("toggle", "Circle", settings.tool=="circle",
        function(value){
          CC.draw.settings[ns].tool = "circle";
          CC.gui.update();
        });
        el.appendChild(circle_el);
        var rectangle_el = CC.gui.makeElement("toggle", "Rectangle", settings.tool=="rectangle",
        function(value){
          CC.draw.settings[ns].tool = "rectangle";
          CC.gui.update();
        });
        el.appendChild(rectangle_el);

      }
    }else{
      CC.gui.el.style.display = "none";
    }
  };
  CC.gui.makeElement = function(type){
    var args = Array.prototype.slice.call(arguments, 1);
    var el = document.createElement('span');
    el.style.marginRight = "4px";
    el.style.padding = "3px 6px";
    var input, onChange;
    switch(type){
      case "color":
        var color = args[0];
        onChange = args[1];
        input = document.createElement("input");
        input.type = "color";
        input.value = color;
        input.onchange = onChange;
        el.appendChild(input);
        break;
      case "text":
        var label = args[0];
        var value = args[1];
        onChange = args[2];
        input = document.createElement("input");
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
  };

  CC.shutdown = function(){
    CC.toggle(false);
    CC.home.hasJoined = false;
    CC.home.chatroom = null;
    CC.home.wasClosed = true;
  };

  CC.trimChatChildren = function(){
    var home = dAmn.chat.get(CC.home.ns);
    var chat_el = home.channels.main.chat_el;
    var children = chat_el.children;
    var max = 50;
    if(children.length > max){
      var trim = children.length - max;
      while(trim--){
        chat_el.removeChild(children[0]);
      }
    }
  };

  CC.cookie = {
		set: function(name, value, days) {
			var expires;
			if (days) {
				var date = new Date();
				date.setTime(date.getTime()+(days*24*60*60*1000));
				expires = date.toGMTString();
			}
			else expires = "";

			if(!value) value = "";
			if(typeof value == "number") value += "";
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
					return ca[i].slice(nameEQ.length);
			}
			return null;
		},
		erase: function(name) {
			CC.cookie.set(name,"",-1);
		}
	};

  CC.setup = function(){
    CC.screenWidth = document.body.offsetWidth;

    var cookie = CC.cookie.get("CC_autojoin");
    if(cookie != null){
      CC.home.autojoin = cookie == "true";
    }

    // Use /clearcanvas to clear the canvas of the current chatroom
    dAmn.command("clearcanvas", 0, function(args){
      if(CC.isSetup){
        CC.drawing.clear();
      }
    });

    // Use /draw to open up the home chatroom and activate drawing
    dAmn.command("draw", 0, function(args){
      if(!(CC.home.ns in dAmn.chat.chatrooms)){
        dAmn.send.join(CC.home.ns);
      }
    });

    // Use /ccautojoin to toggle whether the home chatroom is opened on startup
    dAmn.command("ccautojoin", 0, function(args){
      var setting = !CC.home.autojoin;
      CC.cookie.set("CC_autojoin", setting?"true":"false", 365);
      dAmn.chat.notice("dAmn Chatroom Canvas "+(setting?"will":"won't")+" open #"+CC.home.ns.split(":")[1]+" on startup.");
    });

    // On Join Channel
    dAmn.event.listen("dAmnChat", function(event){
      var ns = event.args[0];
      if(ns == CC.home.ns){
        // The home chatroom has been joined
        event.after(function(chatroom){
          CC.home.hasJoined = true;
          CC.home.chatroom = chatroom;
          CC.drawing.setup();
          CC.chatroom.setup(chatroom);
          CC.gui.setup();
          CC.toggle(true);
          if(!CC.isSetup){
            var original = Object.keys(dAmn.chat.chatrooms)[0];
            setTimeout(function(){
              dAmn.chat.activate(original);
            }, 600);
          }
          CC.isSetup = true;
        });
      }else{
        // Another chatroom has been joined
        event.after(function(chatroom){
          CC.chatroom.setup(chatroom);
          CC.toggle(CC.isToggled);
          if(!CC.home.wasClosed && CC.home.autojoin && !CC.home.hasJoined && !(CC.home.ns in dAmn.chat.chatrooms)){
            // If home hasn't been joined then automatically join it
            dAmn.send.join(CC.home.ns);
            CC.home.hasJoined = true;
          }
        });
      }
    });

    // On close/part Channel
    dAmn.event.listen("dAmnChat_Remove", function(event){
      var ns = event.args[0];
      if(ns == CC.home.ns){
        CC.shutdown();
      }
    });

    // On switch tab/chatroom
    dAmn.event.listen("dAmnChatTabs_activate", function(event){
      event.after(function(){
        var chatroom = dAmn.chat.get();
        CC.toggle(CC.isToggled);
        CC.draw.drawing(chatroom.ns);
      });
    });

    // When you press Esacpe, toggle between chat & drawing mode
    window.addEventListener("keyup", CC.onEscapeToggle, false);

    // Whenever client recieves an action (via /me chat command)
    dAmn.chat.events.onAction(function(event){
      if(this.cr){
        var user = event.args[0];
        var action = event.args[1];
        var ns = this.cr.ns;
        if(ns == CC.home.ns){
          // Action was recieved in the home room so parse for drawing commands
          CC.parseAction(user, action);
          CC.trimChatChildren();
        }
      }
    });

    setInterval(CC.onInterval, 300);
  };

  DWait.ready(['jms/pages/chat07/chatpage.js', 'jms/pages/chat07/dAmn.js', 'jms/pages/chat07/dAmnChat.js'], function() {
    CC.setup();
  });
}


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
    dAmn.chat.activate = function(ns){
      dAmnChatTabs_activate(ns);
    }
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

execute_script("("+dAmnHelper_Script.toString()+")();",
"dAmnHelper_Script");
execute_script("("+CCScript.toString()+")();", "dAmnChatroomCanvas_Script");
