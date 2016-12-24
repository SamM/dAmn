// ==UserScript==
// @name           dAmnGoodies
// @description    Novelty features for dAmn chat.
// @author         Sam Mulqueen <sammulqueen.nz@gmail.com>
// @version        3.0.3
// @include        http://chat.deviantart.com/chat/*
// ==/UserScript==

function dAmnGoodies_Script(){
  var DG = {};
  window.DG = DG;

  DG.version = "3.0.3";

  //var audio = new Audio("http://soundbible.com/grab.php?id=2156&type=wav");
  //audio.play();

  DG.goodies = {};
  DG.Goodie = function(name, defaultData, setup){
    DG.goodies[name] = typeof DG.goodies[name] == "object" ? DG.goodies[name]:typeof defaultData == "object"?defaultData:{};
    var newData;
    if(typeof setup == "function"){
      try{
        newData = setup.call(this, DG.goodies[name], name);
      }catch(ex){
        console.log("dAmnGoodies Error (goodies_setup) : "+ex.message);
      }
    }
    if(typeof newData == "object"){
      DG.goodies[name] = newData;
    }
  };

  DG.save = function(){
    try{
      $.jStorage.set("dAmnGoodies3", DG.goodies);
    }catch(ex){
      console.log("dAmnGoodies Error (save_goodies) : "+ex.message);
    }
    return DG;
  };

  DG.load = function(){
    try{
      var loaded = $.jStorage.get("dAmnGoodies3");
      if(!loaded || typeof loaded != 'object'){
        loaded = $.jStorage.get("dAmnGoodies");
        if(!loaded || typeof loaded != "object"){
          loaded = {};
        }else{
          //Import config from dAmnGoodies v2
          loaded.klat.enabled = load.klat.on;
          delete loaded.klat.on;
          loaded.nick = loaded.nickname;
          delete loaded.nickname;
          loaded.nick.nicknames = loaded.nick.nicks;
          loaded.nick.tagsEnabled = loaded.nick.switchTags;
          delete loaded.nick.nicks;
          delete loaded.nick.switchTags;
          delete loaded.safe;
        }
      }
      DG.goodies = loaded;
    }catch(ex){
      console.log("dAmnGoodies Error (load_goodies) : "+ex.message);
    }
    return DG;
  };

  DG.standardToggle = function(settings, args, enableMsg, disableMsg){
    if(args === null || args === ""){
      settings.enabled = !settings.enabled;
      dAmn.chat.notice(settings.enabled?enableMsg:disableMsg,2);
      DG.save();
    }else{
      if(args == "on"){
        settings.enabled = true;
        dAmn.chat.notice(enableMsg,2);
        DG.save();
      }
      if(args == "off"){
        settings.enabled = false;
        dAmn.chat.notice(disableMsg,2);
        DG.save();
      }
    }
  };

  DG.setup = function(){
    DG.load();

    // Backwards Talking
    // When enabled everything you send will be reversed
    // e.g. "something" becomes "gnihtemos"
    new DG.Goodie("klat", {enabled: false}, function(settings){
      dAmn.chat.events.Send(function(event){
        if(DG.goodies.safe && DG.goodies.safe.count){
          return;
        }
        if(event.args[0]!="msg"&&event.args[0]!="action") return;
        if(settings.enabled){
          event.args[2] = event.args[2].split("").reverse().join("");
        }
      });
      dAmn.command("klat", 0, function(args){
        DG.standardToggle(settings, args, "!sdrawkcab klat ot emiT", "No more talking backwards");
      });
    });

    function toTitleCase(str){
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    // Capitalize Words
    // This will make all words you say be capitalized
    // e.g. "something like this" becomes "Something Like This"
    new DG.Goodie("capitals", {enabled: false}, function(settings){
      dAmn.chat.events.Send(function(event){
        if(DG.goodies.safe && DG.goodies.safe.count){
          return;
        }
        if(event.args[0]!="msg"&&event.args[0]!="action") return;
        if(settings.enabled){
          event.args[2] = toTitleCase(event.args[2]);
        }
      });
      dAmn.command("capitals", 0, function(args){
        DG.standardToggle(settings, args, "Using Capital Letters To Start Words", "No more capitalized words");
      });
    });

    function upsideDownText(srcText) {
      // Adapted from http://twiki.org/cgi-bin/view/Blog/BlogEntry201110x2
      var out = '';
      for( var i = srcText.length - 1; i >= 0; --i ) {
        var ch = srcText.charAt( i );
        if( ch == 'a' ) { out += '\u0250'; }
        else if( ch == 'b' ) { out += 'q'; }
        else if( ch == 'c' ) { out += '\u0254'; }
        else if( ch == 'd' ) { out += 'p'; }
        else if( ch == 'e' ) { out += '\u01DD'; }
        else if( ch == 'f' ) { out += '\u025F'; }
        else if( ch == 'g' ) { out += '\u0183'; } //1D77' }
        else if( ch == 'h' ) { out += '\u0265'; }
        else if( ch == 'i' ) { out += '\u0131'; } //1D09' '\u01C3' '\u0131' }
        else if( ch == 'j' ) { out += '\u017F'; } //1D98' '\u0638' }
        else if( ch == 'k' ) { out += '\u029E'; }
        else if( ch == 'l' ) { out += '\u05DF'; }
        else if( ch == 'm' ) { out += '\u026F'; }
        else if( ch == 'n' ) { out += 'u'; }
        else if( ch == 'o' ) { out += 'o'; }
        else if( ch == 'p' ) { out += 'd'; }
        else if( ch == 'q' ) { out += 'b'; }
        else if( ch == 'r' ) { out += '\u0279'; }
        else if( ch == 's' ) { out += 's'; }
        else if( ch == 't' ) { out += '\u0287'; }
        else if( ch == 'u' ) { out += 'n'; }
        else if( ch == 'v' ) { out += '\u028C'; }
        else if( ch == 'w' ) { out += '\u028D'; }
        else if( ch == 'x' ) { out += 'x'; }
        else if( ch == 'y' ) { out += '\u028E'; }
        else if( ch == 'z' ) { out += 'z'; }
        else if( ch == '(' ) { out += ')'; }
        else if( ch == ')' ) { out += '('; }
        else if( ch == '{' ) { out += '}'; }
        else if( ch == '}' ) { out += '{'; }
        else if( ch == '[' ) { out += ']'; }
        else if( ch == ']' ) { out += '['; }
        else if( ch == '<' ) { out += '>'; }
        else if( ch == '>' ) { out += '<'; }
        else if( ch == '0' ) { out += '0'; }
        else if( ch == '1' ) { out += '\u0196'; }
        else if( ch == '2' ) { out += '\u01A7'; }
        else if( ch == '3' ) { out += '\u0190'; }
        else if( ch == '4' ) { out += '\u152D'; } // 056B' }
        else if( ch == '5' ) { out += 'S'; }
        else if( ch == '6' ) { out += '9'; }
        else if( ch == '7' ) { out += 'L'; }
        else if( ch == '8' ) { out += '8'; }
        else if( ch == '9' ) { out += '6'; }
        else if( ch == '?' ) { out += '\u00BF'; }
        else if( ch == '\u00BF' ) { out += '?'; }
        else if( ch == '!' ) { out += '\u00A1'; }
        else if( ch == '\u00A1' ) { out += '!'; }
        else if( ch == "\'" ) { out += ','; }
        else if( ch == ',' ) { out += "\'"; }
        else if( ch == '.' ) { out += '\u02D9'; }
        else if( ch == '_' ) { out += '\u203E'; }
        else if( ch == ';' ) { out += '\u061B'; }
        else if( ch == '"' ) { out += '\u201E'; }
        else if( ch == "'" ) { out += ','; }
        else if( ch == '&' ) { out += '\u214B'; }
        else { out += ch }
      }
      return out;
    }

    new DG.Goodie("upsidedown", {enabled: false}, function(settings){
      dAmn.chat.events.Send(function(event){
        if(DG.goodies.safe && DG.goodies.safe.count){
          return;
        }
        if(event.args[0]!="msg"&&event.args[0]!="action") return;
        if(settings.enabled){
          event.args[2] = upsideDownText(event.args[2].toLowerCase());
        }
      });
      dAmn.command("upsidedown", 0, function(args){
        DG.standardToggle(settings, args, "Your messages will be flipped upside down", "No more upside down letters");
      });
    });

    function randomDo(){
      return Math.random()>=0.5;
    }

    function randomLetter(){
      var alphabet = "abcdefghijklmnopqrstuvwxyz";
      return alphabet.charAt(Math.floor(Math.random()*alphabet.length));
    }

    function toMessedUp(str){
      var out = "";
      for(var i=0; i<str.length; i++){
        var c = str.charAt(i);
        if(c == " "){
          out += " ";
        }else if(randomDo()){
          out += c;
        }else if(randomDo()){
          out += c;
        }else if(randomDo()){
          var l = randomLetter();
          if(c.toUpperCase() == c){
            l = l.toUpperCase();
          }
          out += l;
        }else if(randomDo()){
          out += c;
        }else if(randomDo()){
          out += c;
        }
      }
      return out;
    }

    new DG.Goodie("drunk", {enabled: false}, function(settings){
      dAmn.chat.events.Send(function(event){
        if(DG.goodies.safe && DG.goodies.safe.count){
          return;
        }
        if(event.args[0]!="msg"&&event.args[0]!="action") return;
        if(settings.enabled){
          event.args[2] = toMessedUp(event.args[2]);
        }
      });
      dAmn.command("drunk", 0, function(args){
        DG.standardToggle(settings, args, "You're now drunk", "Oh sweet sobriety");
      });
    });

    new DG.Goodie("quicktab", {enabled: true, tablist: []}, function(settings){
      DG.quicktab = {};
      var qt = DG.quicktab;
      qt.tablist = settings.tablist;
      qt.tabstart = -1;
      qt.tabindex = -1;
      qt.add = function(user){
        var list = [];
        qt.tablist.forEach(function(name, i){
          if(i<20 && name.toLowerCase() != user.toLowerCase()){
            list.push(name);
          }
        });
        list.unshift(user);
        qt.tablist = list;
        settings.tablist = list;
        DG.save();
      }

      dAmn.command("quicktab", 0, function(args){
        DG.standardToggle(settings, args, "Quick-tabbing is now enabled. (Press [Tab] with empty text-box to use.)", "Quick-tabbing disabled.");
        if(args == "clear"){
          settings.tablist = [];
          qt.tablist = [];
          DG.save();
          dAmn.chat.notice("Quick-tab list cleared.", 1);
        }else if(args == "list"){
          dAmn.chat.notice("Quick-tab list: "+qt.tablist.join(", "), 4);
        }
      });

      function findTab(event){
        if(!settings.enabled) return;
        var user = event.args[0],
        text = event.args[1];
        if(user != dAmn_Client_Username){
          if(text.toLowerCase().search(dAmn_Client_Username.toLowerCase())>-1){
            DG.quicklist.add(user);
          }
        }
      }
      dAmn.chat.events.onMsg(findTab);
      dAmn.chat.events.onAction(findTab);
      dAmn.event.listen("dAmnChatInput.prototype.onKey", function(event){
        if(!settings.enabled) return;
        var e = event.args[0];
        var kc = event.args[1];
        var force = event.args[2];
        var el = this.chatinput_el;
        var qt = DG.quicktab;
        if(kc == 9){
          if(el.value == "" || el.value.slice(-1) == " "){
            if(qt.tablist.length && qt.tabindex > -1){
              qt.tabindex++;
              qt.tabindex%=qt.tablist.length;
              el.value = el.value.slice(0,qt.tabstart)+qt.tablist[qt.tabindex]+(qt.tabstart===0?": ":" ");
              event.preventDefault();
              event.returnValue = false;
            }else{
              if(!this.tablist){
                qt.tabstart = 0;
                qt.tabindex = 0;
                if(qt.tablist.length){
                  el.value = el.value.slice(0,qt.tabstart)+qt.tablist[qt.tabindex]+": ";
                }
                event.preventDefault();
                event.returnValue = false;
              }
            }
          }else{
            qt.tabindex = -1;
          }
        }else{
          qt.tabindex = -1;
        }
      });

      dAmn.chat.events.Send(function(event){
        if(!settings.enabled) return;
        if(event.args[0]!="msg") return;
        var msg = event.args[2];
        var colon = msg.indexOf(":");
        var space = msg.indexOf(" ");
        if(colon>-1){
          if((space>-1 && space > colon) || space==-1){
            var name = msg.slice(0,colon);
            var chatroom = dAmn.chat.get();
            var members = Object.keys(chatroom.members.members);
            var found = false;
            members.forEach(function(member){
              if(member.toLowerCase() == name.toLowerCase()){
                found = member;
              }
            });
            if(found){
              DG.quicktab.add(found);
            }
          }
        }
      });
    });

    new DG.Goodie("swap", {
      enabled: true,
      pairs: {
        "dAmn Goodies": ":thumb652858070:",
        "dAmnGoodies": ":thumb652858070:"
      }
    },
    function(settings){
      dAmn.command("swap", 1, function(args){
        var word, swap;
        var split = args.split(" ");
        switch(split[0]){
          case "on":
          case "off":
            DG.standardToggle(settings, args, "Word swapping is now enabled.", "Word swapping is now disabled.");
            break;
          case "list":
            var pairs = [];
            for(word in settings.pairs){
              pairs.push("<b>"+word+"</b> =&gt; "+settings.pairs[word]);
            }
            dAmn.chat.notice(pairs.join(", "), 5);
            break;
          case "set":
            if(split[1] && split[2]){
              word = split[1];
              if(word[0] == "\""){
                var count = 1;
                while(count < split.length){
                  count++;
                  if(word.slice(-1) == "\""){
                    word = word.slice(1,-1);
                    break;
                  }else{
                    if(count == split.length){
                      dAmn.chat.notice("Error: Missing closing quote (\")");
                      return;
                    }
                    word += " "+split[count];
                  }
                }
                swap = split.slice(count).join(" ");
              }else{
                swap = split.slice(2).join(" ");
              }
              if(!word.length){
                dAmn.chat.notice("Error: Missing word in /swap set <i>word</i> <i>newValue</i>");
                return;
              }
              if(!swap.length){
                dAmn.chat.notice("Error: Missing newValue in /swap set <i>word</i> <i>newValue</i>");
                return;
              }
              settings.pairs[word] = swap;
              dAmn.chat.notice("<b>"+word+"</b> will now be replaced by <b>"+swap+"</b>.");
              DG.save();
            }else{
              dAmn.chat.notice("Usage: /swap set <i>word</i> <i>newValue</i>");
            }
            break;
          case "unset":
            if(split[1]){
              word = split[1];
              if(split.length > 2){
                word = split.slice(1).join(" ");
                if(word.slice(0,1) == "\"" && word.slice(-1)=="\""){
                  word = word.slice(1,-1);
                }
              }
              if(settings.pairs[word]){
                delete settings.pairs[word];
                dAmn.chat.notice("Swapping for <b>"+word+"</b> has been unset.");
                DG.save();
              }else{
                dAmn.chat.notice("No replacement for <b>"+word+"</b> was found to unset.");
              }
            }else{
              dAmn.chat.notice("Usage: /swap unset <i>word</i>");
            }
            break;
          case "clear":
            if(confirm("Are you sure you would like to clear all word replacements?")){
              settings.pairs = {};
              dAmn.chat.notice("All word replacements have been cleared.");
              DG.save();
            }
            break;
          default:
            dAmn.chat.notice("Usage: /swap [on,off,list,set,unset,clear]");
          break;
        }
      });

      DG.escapeRegExp = function(string){
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
      };

      dAmn.chat.events.Send(function(event){
        if(DG.goodies.safe && DG.goodies.safe.count){
          return;
        }
        if(event.args[0]!="msg"&&event.args[0]!="action") return;
        if(settings.enabled){
          var msg = " "+event.args[2]+" ";
          for(var word in settings.pairs){
            re = new RegExp("\\s"+DG.escapeRegExp(word)+"\\s", "g");
            if(msg.search(re) > -1){
              msg = msg.replace(re, " "+settings.pairs[word]+" ");
            }
          }
          event.args[2] = msg.slice(1,-1);
        }
      });
    });

    new DG.Goodie("nick", {
      enabled: true,
      tagsEnabled: false,
      nicknames: {
        sumopiggy: "Sam"
      }
    }, function(settings){
      dAmn.command("nick", 1, function(args){
        var username, nickname;
        var split = args.split(" ");
        switch(split[0]){
          case "on":
          case "off":
            DG.standardToggle(settings, args, "Nicknames are now enabled.", "Nicknames are now disabled.");
            break;
          case "list":
            var pairs = [];
            for(username in settings.nicknames){
              pairs.push("<b>"+username+"</b> =&gt; "+settings.nicknames[username]);
            }
            dAmn.chat.notice(pairs.join(", "), 5);
            break;
          case "set":
            if(split[1] && split[2]){
              username = split[1].toLowerCase();
              nickname = split.slice(2).join(" ");
              settings.nicknames[username] = nickname;
              dAmn.chat.notice("Nickname for <b>"+split[1]+"</b> has been set to <b>"+nickname+"</b>.");
              DG.save();
            }else{
              dAmn.chat.notice("Usage: /nick set <i>Username</i> <i>Nickname</i>");
            }
            break;
          case "unset":
            if(split[1]){
              username = split[1].toLowerCase();
              if(settings.nicknames[username]){
                delete settings.nicknames[username];
                dAmn.chat.notice("Nickname for "+split[1]+" has been unset.");
                DG.save();
              }else{
                dAmn.chat.notice("No nickname for "+split[1]+" was found to unset.");
              }
            }else{
              dAmn.chat.notice("Usage: /nick unset <i>Username</i>");
            }
            break;
          case "clear":
            if(confirm("Are you sure you would like to clear all nicknames?")){
              settings.nicknames = {};
              dAmn.chat.notice("All nicknames have been cleared.");
              DG.save();
            }
            break;
          case "tags":
            if(split[1] == "on"){
              settings.tagsEnabled = true;
              dAmn.chat.notice("<b>&lt;Username&gt;</b> tags in chat will now be replaced with nicknames");
              DG.save();
            }else if(split[1] == "off"){
              settings.tagsEnabled = false;
              dAmn.chat.notice("<b>&lt;Username&gt;</b> tags in chat will not be replaced with nicknames");
              DG.save();
            }else{
              dAmn.chat.notice("Usage: /nick tags [on|off]");
            }
            break;
          default:
            dAmn.chat.notice("Usage: /nick [on,off,list,set,tags,unset,clear]");
          break;
        }
      });

      dAmn.chat.events.Send(function(event){
        if(DG.goodies.safe && DG.goodies.safe.count){
          return;
        }
        if(event.args[0]!="msg"&&event.args[0]!="action") return;
        if(settings.enabled){
          var msg = event.args[2];
          for(var user in settings.nicknames){
            re = new RegExp("\\b"+DG.escapeRegExp(user)+"\\b", "gi");
            if(msg.search(re) > -1){
              msg = msg.replace(re, "<abbr title=\""+user+"\">"+settings.nicknames[user]+"</abbr>");
            }
          }
          event.args[2] = msg;
        }
      });

      dAmn.chat.events.onMsg(function(event){
        if(!settings.tagsEnabled) return;
        var username = event.args[0].toLowerCase();
        if(settings.nicknames[username]){
          event.args[0] = "<abbr title=\""+event.args[0]+"\">"+settings.nicknames[username]+"</abbr>";
        }
      });
    });

    new DG.Goodie("safe", {count: 0}, function(settings){
      dAmn.command("safe", 0, function(args){
        if(args === null || args === ""){
          settings.count = 1;
          dAmn.chat.notice("The next message sent will be safe from being altered by dAmn Goodies.");
        }else{
          var count = parseInt(args);
          if(isNaN(count)){
            dAmn.chat.notice("Usage example: /safe 5<b>(This will make the next 5 messages sent safe from being altered)");
          }else{
            settings.count = count;
            dAmn.chat.notice("The next "+(count==0||count>1?count+" messages":"message")+" sent will be safe from being altered by dAmn Goodies.");
          }
        }
        console.log(settings.count, DG.goodies.safe.count);
      });
      dAmn.chat.events.Send(function(event){
        if(event.args[0]!="msg"&&event.args[0]!="action"&&event.args[0]!="npmsg") return;
        event.after(function(){
          if(settings.count>0){
            settings.count--;
          }
        });
      });
    });

    new DG.Goodie("antikick", {enabled: false, delay: 0, exceptions: []}, function(settings){
      dAmn.command("antikick", 0, function(args){
        DG.standardToggle(settings, args, "Antikick is enabled.", "Antikick is disabled.");
        if(args!=null&&args!=""){
          var split = args.split(" ");
          if(split[0] == "list"){
            dAmn.chat.notice("Antikick excluded from these channels: "+(settings.exceptions.length?"#"+settings.exceptions.join(", #"):"No channels are excluded."),4);
          }else if(split[0] == "exclude"){
            if(!split[1]){
              dAmn.chat.notice("Usage: /antikick exclude <i>ChatroomName</i>");
            }else{
              var chatroom = split[1].toLowerCase().replace("#", "");
              if(settings.exceptions.indexOf(chatroom)>-1){
                var list = [];
                settings.exceptions.forEach(function(room){
                  if(room != chatroom){
                    list.push(room);
                  }
                });
                settings.exceptions = list;
                DG.save();
                dAmn.chat.notice("Antikick will work in #"+chatroom+" again now!");
              }else{
                settings.exceptions.push(chatroom);
                DG.save();
                dAmn.chat.notice("Antikick will not be activated in #"+chatroom+".");
              }
            }
          }else if(split[0] == "clear"){
            settings.exceptions = [];
            DG.save();
            dAmn.chat.notice("All chatroom exclusions cleared.");
          }else if(split[0] == "delay"){
            if(!split[1] || isNaN(parseFloat(split[1]))){
              dAmn.chat.notice("Usage: /antikick delay 3 (This sets delay for 3 seconds)")
            }else{
              var delay = parseFloat(split[1]);
              settings.delay = delay;
              dAmn.chat.notice("Delay set to "+delay+" "+(delay==1?"second":"seconds"));
              DG.save();
            }
          }else{
            dAmn.chat.notice("Usage: /antikick [on|off|exclude|list|clear|delay]");
          }
        }
      });

      dAmn.chat.events.onSelfEvent(function(event){
        if(!settings.enabled) return;
        if(event.args[0] == "kicked"){
          var ns = this.cr.ns.toLowerCase().replace("chat:","");
          if(settings.exceptions.indexOf(ns) == -1){
            setTimeout(function(){
              dAmn.send.join(this.cr.ns);
            }, settings.delay*1000)
          }
        }
      });
    });

    dAmn.command("js", 1, function(args){
      try{
        var fn = new Function(args);
        var ret = fn.call(this);
        if(typeof ret != "undefined"){
          dAmn.chat.notice(JSON.stringify(ret));
        }
      }catch(ex){
        dAmn.chat.notice("Error: "+ex.message);
      }
    });

    new DG.Goodie("autojoin", {enabled: true, chatrooms: []}, function(settings){
      DG.autojoined = 0;
      DG.autojoin_timeout = null;
      DG.autojoin_tab_reset = false;

      dAmn.command("autojoin", 1, function(args){
        var split = args.split(" ");
        switch(split[0]){
          case "on":
          case "off":
            DG.standardToggle(settings, args, "Autojoin enabled.", "Autojoin disabled.");
            break;
          case "list":
            if(!settings.chatrooms.length){
              dAmn.chat.notice("There are no chatrooms in your autojoin list.");
            }else{
              dAmn.chat.notice("Automatically joined chatrooms: #"+settings.chatrooms.join(", #"));
            }
            break;
          case "add":
            if(!split[1]){
              dAmn.chat.notice("Usage: /autojoin add <i>ChatroomName</i>");
            }else{
              var chatroom = split[1].toLowerCase().replace("#","");
              if(settings.chatrooms.indexOf(chatroom) > -1){
                dAmn.chat.notice("Already autojoining #"+chatroom);
              }else{
                settings.chatrooms.push(chatroom);
                DG.save();
                dAmn.chat.notice("Added #"+chatroom+" to autojoin list.");
              }
            }
            break;
          case "remove":
            if(!split[1]){
              dAmn.chat.notice("Usage: /autojoin remove <i>ChatroomName</i>");
            }else{
              var chatroom = split[1].toLowerCase().replace("#","");
              if(settings.chatrooms.indexOf(chatroom) > -1){
                var list = [];
                settings.chatrooms.forEach(function(room){
                  if(room != chatroom){
                    list.push(room);
                  }
                });
                settings.chatrooms = list;
                DG.save();
                dAmn.chat.notice("Removed #"+chatroom+" from autojoin list.");
              }else{
                dAmn.chat.notice("#"+chatroom+" is not in autojoin list.");
              }
            }
            break;
          case "clear":
            settings.chatrooms = [];
            DG.save();
            dAmn.chat.notice("Your autojoin list has been cleared.");
            break;
          default:
            dAmn.chat.notice("Usage: /autojoin [on|off|list|add|remove|clear]");
            break;
        }
      });

      dAmn.chat.events.onSelfEvent(function(event){
        if(!settings.enabled || !settings.chatrooms.length) return;
        var cmd = event.args[0];
        if(cmd == "join"){
          if(!DG.autojoined){
            DG.autojoin_ns = this.cr.ns;
            settings.chatrooms.forEach(function(chatroom){
              DG.autojoined++;
              dAmn.send.join("chat:"+chatroom);
            });
          }else{
            if(!DG.autojoin_tab_reset){
              clearTimeout(DG.autojoin_timeout);
              DG.autojoin_timeout = setTimeout(function(){
                dAmn.chat.activate(DG.autojoin_ns);
                DG.autojoin_tab_reset = true;
              }, 500);
            }
          }
        }
      });
    });

    function clumpBrackets(words){
      var output = [],
      save = [];
      words.forEach(function(word){
        if(save.length){
          if(word.slice(-1) == ")"){
            save.push(word.slice(0,-1));
            output.push("("+save.join(" ")+")");
            save = [];
          }else{
            save.push(word);
          }
        }else{
          if(word[0] == "("){
            save.push(word.slice(1));
          }else{
            output.push(word);
          }
        }
      });
      if(save.length){
        output.push(save.join(" "));
      }
      return output;
    }

    function addMembers(pc, list){
      var chatroom = dAmn.chat.get();
      var members = chatroom.members.members;
      for(var name in members){
        if(members[name].info.pc == pc){
          list.push(name);
        }
      }
    }

    dAmn.command("multi", 1, function(args){
      var split = clumpBrackets(args.split(" "));
      var list, text;
      switch(split[0]){
        case "msg":
        case "action":
        case "join":
        case "part":
        case "clear":
        case "title":
        case "topic":
          if(!split[1]){
            return;
          }
          list = split[1][0]=="("&&split[1].slice(-1)==")"?split[1].slice(1,-1).split(" "):[split[1]];
          if(list.length == 1 && list[0] == "{}"){
            list = Object.keys(dAmn.chat.chatrooms);
          }
          text = split.slice(2).join(" ");
          list.forEach(function(room){
            room = "chat:"+room.replace("#", "").replace("chat:", "");
            dAmn.send[split[0]](room, text);
          });
          break;
        case "kick":
        case "ban":
        case "unban":
        case "promote":
        case "demote":
          if(!split[1]) return;
          list = [];
          temp = split[1][0]=="("&&split[1].slice(-1)==")"?split[1].slice(1,-1).split(" "):[split[1]];
          if(temp.length == 1 && temp[0] == "{}"){
            list = Object.keys(dAmn.chat.get().members.members);
          }else{
            temp.forEach(function(name){
              if(name[0] == "*"){
                addMembers(name.slice(1), list);
              }else{
                list.push(name);
              }
            });
          }
          text = split.slice(2).join(" ");
          list.forEach(function(name){
            dAmn.send[split[0]](false, name, text);
          });
          break;
        case "whois":
          list = [];
          temp = split[1][0]=="("&&split[1].slice(-1)==")"?split[1].slice(1,-1).split(" "):[split[1]];
          if(temp.length == 1 && temp[0] == "{}"){
            list = Object.keys(dAmn.chat.get().members.members);
          }else{
            temp.forEach(function(name){
              if(name[0] == "*"){
                addMembers(name.slice(1), list);
              }else{
                list.push(name);
              }
            });
          }
          list.forEach(function(name){
            dAmn.send.whois(name);
          });
          break;
        case "display":
          list = [];
          temp = split[1][0]=="("&&split[1].slice(-1)==")"?split[1].slice(1,-1).split(" "):[split[1]];
          if(temp.length == 1 && temp[0] == "{}"){
            list = Object.keys(dAmn.chat.get().members.members);
          }else{
            temp.forEach(function(name){
              if(name[0] == "*"){
                addMembers(name.slice(1), list);
              }else{
                list.push(name);
              }
            });
          }
          dAmn.chat.notice(list.join(" "),10);
          break;
      }
    });

    dAmn.command("boot", 1, function(args){
      var split = args.split(" "),
        user = split[0],
        reason = split.slice(1).join(" ");
      if(!user) return;
      var pc;
      var members = dAmn.chat.get().members.members;
      for(var name in members){
        if(name.toLowerCase() == user.toLowerCase()){
          user = name;
          pc = members[name].info.pc;
        }
      }
      if(!pc){
        dAmn.chat.notice("User `"+user+"` not found.",2);
        return;
      }
      dAmn.send.kick(false, user, reason?reason:"You have been booted!");
      dAmn.send.ban(false, user);
      setTimeout(function(){
        dAmn.send.unban(false, user);
        dAmn.send.promote(false, user, pc);
      }, 2000);
    });

    new DG.Goodie("notify", {enabled: true, sound_url: "http://soundbible.com/grab.php?id=2156&type=wav"}, function(settings){
      DG.notification_sound = new Audio(settings.sound_url);

      dAmn.command("notify", 1, function(args){
        DG.standardToggle(settings, args, "Sound notifications enabled.", "Sound notifications disabled.");
        var split = args.split(" ");
        switch(split[0]){
          case "set":
            if(!split[1]){
              dAmn.chat.notice("Usage: /notify set [default|<i>http://url.to/soundfile.wav</i>]")
            }else{
              if(split[1] == "default"){
                settings.sound_url = "http://soundbible.com/grab.php?id=2156&type=wav";
              }else{
                settings.sound_url = split[1];
              }
              DG.save();
              DG.notification_sound = new Audio(settings.sound_url);
              DG.notification_sound.play();
              dAmn.chat.notice("URL to Notification Sound set to: "+settings.sound_url);
            }
            break;
          case "stop":
            DG.notification_sound.pause();
            DG.notification_sound.currentTime = 0;
            break;
          case "play":
            DG.notification_sound.pause();
            DG.notification_sound.currentTime = 0;
            DG.notification_sound.play();
            break;
          default:
            dAmn.chat.notice("Usage: /notify [on|off|set|stop|play]");
            break;
        }
      });

      dAmn.event.listen("dAmnChatTabs_newData", function(event){
        if(!settings.enabled) return;
        var hilite = event.args[1];
        if(hilite === 2 && (!document.hasFocus() || dAmn.chat.getActive() != event.args[0])){
          DG.notification_sound.pause();
          DG.notification_sound.currentTime = 0;
          DG.notification_sound.play();
        }
      })

    });

    new DG.Goodie("youtube", {enabled: true}, function(settings){
      DG.youtube = {};
      DG.youtube.videos = {};
      DG.youtube.onPlayerReady = function(event){};
      DG.youtube.onPlayerStateChange = function(event){};
      DG.youtube.loadVideo = function(elId){
        if(YT && YT.Player){
          var player = new YT.Player(elId, {
            height: '240',
            width: '320',
            videoId: elId.split(".")[1],
            events: {
              'onReady': DG.youtube.onPlayerReady,
              'onStateChange': DG.youtube.onPlayerStateChange
            }
          });
          DG.youtube.videos[elId] = player;
          return player;
        }
      };

      window.onYouTubeIframeAPIReady = function(){
        for(var elId in DG.youtube.videos){
          if(!DG.youtube.videos[elId]){
            DG.youtube.loadVideo(elId);
          }
        }
      };

      dAmn.command("youtube", 1, function(args){
        DG.standardToggle(settings, args, "Youtube Videos enabled in chat.", "Youtube Videos disabled in chat.");
      });

      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      DG.youtube.getYoutubeId = function(msg){
        var result = /(http(s)?\:\/\/)?(((www\.)?youtube\.com|youtu\.?be)\/(watch\?v=)?)([\-_\w]+)/gi.exec(msg);
        if(result){
          return result[7];
        }else{
          return null;
        }
      };

      DG.youtube.embedYouTubePlayer = function(ns, id){
        var chatroom = dAmn.chat.get(ns);
        if(!chatroom) return;
        var player = document.createElement("div");
        player.id = "youtube."+id+"."+(new Date()).getTime();
        chatroom.channels.main.addDiv(player, null, 0);
        DG.youtube.videos[player.id] = null;
        DG.youtube.loadVideo(player.id);
      };

      function doYouTube(event){
        if(settings.enabled){
          var msg = event.args[1];
          var ytid = DG.youtube.getYoutubeId(msg);
          if(ytid){
            var ns = this.cr.ns;
            event.after(function(){
              DG.youtube.embedYouTubePlayer(ns, ytid);
            });
          }
        }
      }

      dAmn.chat.events.onMsg(doYouTube);
      dAmn.chat.events.onAction(doYouTube);

    });

    new DG.Goodie("colors", {enabled: true, name: false, msg: false}, function(settings){
      var match_color_tablump = /&abbr\tcolors:([A-Fa-f0-9]{6}):([A-Fa-f0-9]{6})\t/;
      var match_color_tag = /<abbr title="colors:([A-Fa-f0-9]{6}):([A-Fa-f0-9]{6})">/;
      var default_color = "393d3c";

      dAmn.command("color", 1, function(args){
        DG.standardToggle(settings, args, "Custom message colors enabled.", "Custom message colors disabled.");
        var split = args.split(" ");
        switch(split[0]){
          case "none":
            settings.name = false;
            settings.msg = false;
            DG.save();
            dAmn.chat.notice("Reset colors to default style.");
            break;
          case "name":
          case "msg":
            if(!split[1]){
              dAmn.chat.notice("Usage: /color "+split[0]+" #FF0000 (This sets the color to red)");
              return;
            }
            color = split[1].replace("#", "");
            if(color.length != 6){
              dAmn.chat.notice("Usage: /color "+split[0]+" #FF0000 (This sets the color to red)");
              return;
            }
            settings[split[0]] = color;
            DG.save();
            dAmn.chat.notice("Set color for your "+(split[0]=="name"?"username":"message")+" to <b style=\"color:#"+color+"\">#"+color+"</b>");
            break;
          case "show":
            dAmn.chat.notice("Your name is set to <b style=\"color:#"+settings.name+"\">#"+settings.name+"</b>, your message color is set to <b style=\"color:#"+settings.msg+"\">#"+settings.msg+"</b>")
            break;
          default:
            dAmn.chat.notice("Usage: /color [on|off|none|name|msg|show]");
            break;
        }
      });

      function doColors(event){
        if(!settings.enabled) return;
        var el = event.args[0];
        var msg = el.innerHTML;
        var index=msg.indexOf("<abbr title=\"colors:");
        if(index>-1){
          var colors = match_color_tag.exec(msg);
          var from = el.getElementsByClassName("from")[0];
          from.style.color = "#"+colors[1];
          var text = el.getElementsByClassName("text")[0];
          text.style.color = "#"+colors[2];
        }
      }

      dAmn.event.listen("dAmnChanChat.prototype.addDiv", doColors);
      //dAmn.chat.events.onMsg(doColors);
      //dAmn.chat.events.onAction(doColors);

      dAmn.chat.events.Send(function(event){
        if(!settings.enabled) return;
        if(DG.goodies.safe && DG.goodies.safe.count) return;
        if(!settings.name && !settings.msg) return;
        if(event.args[0]!="msg"&&event.args[0]!="action") return;
        var name = settings.name?settings.name:default_color;
        var msg = settings.msg?settings.msg:default_color;
        event.args[2] += "<abbr title=\"colors:"+name.toUpperCase()+":"+msg.toUpperCase()+"\"></abbr>";
      });

    });

    new DG.Goodie("stylesheets", {enabled: true}, function(settings){
      dAmn.command("stylesheets", 1, function(args){
        DG.standardToggle(settings, args, "Chatroom Stylesheets are enabled.", "Chatroom Stylesheets are disabled.");
        if(args == "off" && DG.stylesheet){
          DG.stylesheet.parentNode.removeChild(DG.stylesheet);
          DG.stylesheet = null;
        }
      });

      var stylesheet_regex = /<abbr title="stylesheet:(.*)">(.*)<\/abbr>/gi;
      DG.stylesheet = null;

      function checkTitle(title){
        var match = stylesheet_regex.exec(title);
        var stylesheet;
        if(match!==null){
          stylesheet = "http://"+match[1];
          if(DG.stylesheet){
            DG.stylesheet.href = stylesheet;
          }else{
            DG.stylesheet = document.createElement("link");
            DG.stylesheet.href = stylesheet;
            DG.stylesheet.rel = "stylesheet";
            DG.stylesheet.type = "text/css";
            document.body.appendChild(DG.stylesheet);
          }
        }else{
          if(DG.stylesheet){
            DG.stylesheet.parentNode.removeChild(DG.stylesheet);
            DG.stylesheet = null;
          }
        }
      }

      dAmn.event.listen("dAmnChatTabs_activate", function(event){
        if(!settings.enabled) return;
        if(dAmn.chat.getActive() != event.args[0]){
          event.after(function(){
            var title = dAmn.chat.getTitle(event.args[0]);
            checkTitle(title);
          });
        }
      });

      dAmn.event.listen("dAmnChanMainChat.prototype.onEvent", function(event){
        if(!settings.enabled) return;
        var pkt = event.args[0];
        if(pkt.cmd == "property" && pkt.args.p == "title"){
          if(pkt.param == dAmn.chat.getActive()){
            checkTitle(dAmn.chat.getTitle());
          }
        }
      });
    });

    new DG.Goodie("scrolldown", {enabled: true}, function(settings){
      dAmn.command("scrolldown", 0, function(args){
        DG.standardToggle(settings, args, "Enabled: Scrolling to bottom of chat on double click.", "Disabled: Scrolling to bottom of chat on double click.");
      });
      document.body.ondblclick = function(){
        if(!settings.enabled) return;
        var chatroom = dAmn.chat.get();
        var scroll_el = chatroom.channels.main.scroll_el;
        scroll_el.scrollTop = scroll_el.scrollHeight;
      };
    });

    DG.save();
  };

  DWait.ready(['jms/pages/chat07/chatpage.js', 'jms/pages/chat07/dAmn.js', 'jms/pages/chat07/dAmnChat.js'], function() {
    DG.setup();
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
          });
        }
        if(method.indexOf("dAmnChatInput.prototype.") === 0){
          dAmn.chat.forEach(function(chatroom){
            chatroom.channels.main.input[path[path.length-1]] = dAmn.replaced[method];
          });
        }
        if(method.indexOf("dAmnChat.prototype.") === 0){
          dAmn.chat.forEach(function(chatroom){
            chatroom[path[path.length-1]] = dAmn.replaced[method];
          });
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
      Send: "dAmnChat.prototype.Send",
      onSelfEvent: "dAmnChanMainChat.prototype.onSelfEvent"
    };

    for(var m in methods){
      dAmn.chat.events[m] = (function(method){
        return function(handler){
          return dAmn.event.listen(method, handler);
        };
      })(methods[m]);
    }

    dAmn.resetHistory = function(el){
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
    };

    dAmn.command = function(name, argsRequired, onCommand){
      if(typeof onCommand != "function"){
        throw "dAmn.command: onCommand must be a function";
      }
      if(typeof name != "string"){
        throw "dAmn.command: name must be a string";
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
                dAmn.resetHistory.call(this, el);
                if(this.cmds[cmd][0]) {
                  if (!args) {
                    this.cr.channels.main.onErrorEvent( cmd, 'insufficient parameters' );
                  }else{
                    onCommand.call(this, args);
                  }
                }else{
                  onCommand.call(this, args);
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
    dAmn.send.join = function(ns){
      dAmn_Join(ns);
    };
    dAmn.send.part = function(ns){
      dAmn_Part(ns?ns:dAmn.chat.getActive());
    }
    dAmn.send.kick = function(ns, user, reason){
      dAmn_Kick( ns?ns:dAmn.chat.getActive(), user, dAmnEscape(reason) );
    };
    dAmn.send.ban = function(ns, user){
      var chatroom = dAmn.chat.get(ns);
      if(chatroom && chatroom.Send){
        chatroom.Send("ban", user, "");
      }
    };
    dAmn.send.unban = function(ns, user){
      var chatroom = dAmn.chat.get(ns);
      if(chatroom && chatroom.Send){
        chatroom.Send("unban", user, "");
      }
    };
    dAmn.send.promote = function(ns, user, privclass){
      var chatroom = dAmn.chat.get(ns);
      if(chatroom && chatroom.Send){
        chatroom.Send("promote", user, privclass);
      }
    };
    dAmn.send.demote = function(ns, user, privclass){
      var chatroom = dAmn.chat.get(ns);
      if(chatroom && chatroom.Send){
        chatroom.Send("demote", user, privclass);
      }
    };
    dAmn.send.whois = function(user){
      dAmn_Get( 'login:'+user, 'info' );
    };
    dAmn.send.clear = function(ns){
      var chatroom = dAmn.chat.get(ns);
      if(chatroom && chatroom.channels.main.Clear){
        chatroom.channels.main.Clear();
      }
    };
    dAmn.send.title = function(ns, text){
      dAmn_Set( ns?ns:dAmn.chat.getActive(), "title", dAmnEscape(text) );
    };
    dAmn.send.topic = function(ns, text){
      dAmn_Set( ns?ns:dAmn.chat.getActive(), "topic", dAmnEscape(text) );
    };

    dAmn.chat.chatrooms = dAmnChats;
    dAmn.chat.tabs = dAmnChatTabs;
    dAmn.chat.stack = dAmnChatTabStack;
    dAmn.chat.getActive = function(returnChatroom){
      if(returnChatroom){
        return dAmn.chat.get(dAmnChatTab_active);
      }
      return dAmnChatTab_active;
    };
    dAmn.chat.activate = function(ns){
      dAmnChatTabs_activate( ns, true );
    };
    dAmn.chat.get = function(ns){
      if(typeof ns != "string"){
        ns = dAmnChatTab_active;
      }else{
        for(var room in dAmn.chat.chatrooms){
          if(room.toLowerCase() == ns.toLowerCase()){
            ns = room;
            break;
          }
        }
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
    };
  }

  DWait.ready(['jms/pages/chat07/chatpage.js', 'jms/pages/chat07/dAmn.js', 'jms/pages/chat07/dAmnChat.js'], function() {
    SetupdAmn();
  });
}

function execute_script(id, script){
	var el = document.createElement('script');
	if(id) el.id = id;
  if(typeof script == "function"){
    script = "("+script.toString()+")();";
  }
  if(typeof script == "string"){
    el.appendChild(document.createTextNode(script));
    document.getElementsByTagName("head")[0].appendChild(el);
  }
	return el;
}
execute_script("JS_Storage", function(){function C(){var a="{}";if("userDataBehavior"==f){g.load("jStorage");try{a=g.getAttribute("jStorage")}catch(b){}try{r=g.getAttribute("jStorage_update")}catch(c){}h.jStorage=a}D();x();E()}function u(){var a;clearTimeout(F);F=setTimeout(function(){if("localStorage"==f||"globalStorage"==f)a=h.jStorage_update;else if("userDataBehavior"==f){g.load("jStorage");try{a=g.getAttribute("jStorage_update")}catch(b){}}if(a&&a!=r){r=a;var l=p.parse(p.stringify(c.__jstorage_meta.CRC32)),k;C();k=p.parse(p.stringify(c.__jstorage_meta.CRC32));
var d,n=[],e=[];for(d in l)l.hasOwnProperty(d)&&(k[d]?l[d]!=k[d]&&"2."==String(l[d]).substr(0,2)&&n.push(d):e.push(d));for(d in k)k.hasOwnProperty(d)&&(l[d]||n.push(d));s(n,"updated");s(e,"deleted")}},25)}function s(a,b){a=[].concat(a||[]);var c,k,d,n;if("flushed"==b){a=[];for(c in m)m.hasOwnProperty(c)&&a.push(c);b="deleted"}c=0;for(d=a.length;c<d;c++){if(m[a[c]])for(k=0,n=m[a[c]].length;k<n;k++)m[a[c]][k](a[c],b);if(m["*"])for(k=0,n=m["*"].length;k<n;k++)m["*"][k](a[c],b)}}function v(){var a=(+new Date).toString();
if("localStorage"==f||"globalStorage"==f)try{h.jStorage_update=a}catch(b){f=!1}else"userDataBehavior"==f&&(g.setAttribute("jStorage_update",a),g.save("jStorage"));u()}function D(){if(h.jStorage)try{c=p.parse(String(h.jStorage))}catch(a){h.jStorage="{}"}else h.jStorage="{}";z=h.jStorage?String(h.jStorage).length:0;c.__jstorage_meta||(c.__jstorage_meta={});c.__jstorage_meta.CRC32||(c.__jstorage_meta.CRC32={})}function w(){if(c.__jstorage_meta.PubSub){for(var a=+new Date-2E3,b=0,l=c.__jstorage_meta.PubSub.length;b<
l;b++)if(c.__jstorage_meta.PubSub[b][0]<=a){c.__jstorage_meta.PubSub.splice(b,c.__jstorage_meta.PubSub.length-b);break}c.__jstorage_meta.PubSub.length||delete c.__jstorage_meta.PubSub}try{h.jStorage=p.stringify(c),g&&(g.setAttribute("jStorage",h.jStorage),g.save("jStorage")),z=h.jStorage?String(h.jStorage).length:0}catch(k){}}function q(a){if("string"!=typeof a&&"number"!=typeof a)throw new TypeError("Key name must be string or numeric");if("__jstorage_meta"==a)throw new TypeError("Reserved key name");
return!0}function x(){var a,b,l,k,d=Infinity,n=!1,e=[];clearTimeout(G);if(c.__jstorage_meta&&"object"==typeof c.__jstorage_meta.TTL){a=+new Date;l=c.__jstorage_meta.TTL;k=c.__jstorage_meta.CRC32;for(b in l)l.hasOwnProperty(b)&&(l[b]<=a?(delete l[b],delete k[b],delete c[b],n=!0,e.push(b)):l[b]<d&&(d=l[b]));Infinity!=d&&(G=setTimeout(x,Math.min(d-a,2147483647)));n&&(w(),v(),s(e,"deleted"))}}function E(){var a;if(c.__jstorage_meta.PubSub){var b,l=A,k=[];for(a=c.__jstorage_meta.PubSub.length-1;0<=a;a--)b=
c.__jstorage_meta.PubSub[a],b[0]>A&&(l=b[0],k.unshift(b));for(a=k.length-1;0<=a;a--){b=k[a][1];var d=k[a][2];if(t[b])for(var n=0,e=t[b].length;n<e;n++)try{t[b][n](b,p.parse(p.stringify(d)))}catch(g){}}A=l}}var y=window.jQuery||window.$||(window.$={}),p={parse:window.JSON&&(window.JSON.parse||window.JSON.decode)||String.prototype.evalJSON&&function(a){return String(a).evalJSON()}||y.parseJSON||y.evalJSON,stringify:Object.toJSON||window.JSON&&(window.JSON.stringify||window.JSON.encode)||y.toJSON};if("function"!==
typeof p.parse||"function"!==typeof p.stringify)throw Error("No JSON support found, include //cdnjs.cloudflare.com/ajax/libs/json2/20110223/json2.js to page");var c={__jstorage_meta:{CRC32:{}}},h={jStorage:"{}"},g=null,z=0,f=!1,m={},F=!1,r=0,t={},A=+new Date,G,B={isXML:function(a){return(a=(a?a.ownerDocument||a:0).documentElement)?"HTML"!==a.nodeName:!1},encode:function(a){if(!this.isXML(a))return!1;try{return(new XMLSerializer).serializeToString(a)}catch(b){try{return a.xml}catch(c){}}return!1},
decode:function(a){var b="DOMParser"in window&&(new DOMParser).parseFromString||window.ActiveXObject&&function(a){var b=new ActiveXObject("Microsoft.XMLDOM");b.async="false";b.loadXML(a);return b};if(!b)return!1;a=b.call("DOMParser"in window&&new DOMParser||window,a,"text/xml");return this.isXML(a)?a:!1}};y.jStorage={version:"0.4.12",set:function(a,b,l){q(a);l=l||{};if("undefined"==typeof b)return this.deleteKey(a),b;if(B.isXML(b))b={_is_xml:!0,xml:B.encode(b)};else{if("function"==typeof b)return;
b&&"object"==typeof b&&(b=p.parse(p.stringify(b)))}c[a]=b;for(var k=c.__jstorage_meta.CRC32,d=p.stringify(b),g=d.length,e=2538058380^g,h=0,f;4<=g;)f=d.charCodeAt(h)&255|(d.charCodeAt(++h)&255)<<8|(d.charCodeAt(++h)&255)<<16|(d.charCodeAt(++h)&255)<<24,f=1540483477*(f&65535)+((1540483477*(f>>>16)&65535)<<16),f^=f>>>24,f=1540483477*(f&65535)+((1540483477*(f>>>16)&65535)<<16),e=1540483477*(e&65535)+((1540483477*(e>>>16)&65535)<<16)^f,g-=4,++h;switch(g){case 3:e^=(d.charCodeAt(h+2)&255)<<16;case 2:e^=
(d.charCodeAt(h+1)&255)<<8;case 1:e^=d.charCodeAt(h)&255,e=1540483477*(e&65535)+((1540483477*(e>>>16)&65535)<<16)}e^=e>>>13;e=1540483477*(e&65535)+((1540483477*(e>>>16)&65535)<<16);k[a]="2."+((e^e>>>15)>>>0);this.setTTL(a,l.TTL||0);s(a,"updated");return b},get:function(a,b){q(a);return a in c?c[a]&&"object"==typeof c[a]&&c[a]._is_xml?B.decode(c[a].xml):c[a]:"undefined"==typeof b?null:b},deleteKey:function(a){q(a);return a in c?(delete c[a],"object"==typeof c.__jstorage_meta.TTL&&a in c.__jstorage_meta.TTL&&
delete c.__jstorage_meta.TTL[a],delete c.__jstorage_meta.CRC32[a],w(),v(),s(a,"deleted"),!0):!1},setTTL:function(a,b){var l=+new Date;q(a);b=Number(b)||0;return a in c?(c.__jstorage_meta.TTL||(c.__jstorage_meta.TTL={}),0<b?c.__jstorage_meta.TTL[a]=l+b:delete c.__jstorage_meta.TTL[a],w(),x(),v(),!0):!1},getTTL:function(a){var b=+new Date;q(a);return a in c&&c.__jstorage_meta.TTL&&c.__jstorage_meta.TTL[a]?(a=c.__jstorage_meta.TTL[a]-b)||0:0},flush:function(){c={__jstorage_meta:{CRC32:{}}};w();v();s(null,
"flushed");return!0},storageObj:function(){function a(){}a.prototype=c;return new a},index:function(){var a=[],b;for(b in c)c.hasOwnProperty(b)&&"__jstorage_meta"!=b&&a.push(b);return a},storageSize:function(){return z},currentBackend:function(){return f},storageAvailable:function(){return!!f},listenKeyChange:function(a,b){q(a);m[a]||(m[a]=[]);m[a].push(b)},stopListening:function(a,b){q(a);if(m[a])if(b)for(var c=m[a].length-1;0<=c;c--)m[a][c]==b&&m[a].splice(c,1);else delete m[a]},subscribe:function(a,
b){a=(a||"").toString();if(!a)throw new TypeError("Channel not defined");t[a]||(t[a]=[]);t[a].push(b)},publish:function(a,b){a=(a||"").toString();if(!a)throw new TypeError("Channel not defined");c.__jstorage_meta||(c.__jstorage_meta={});c.__jstorage_meta.PubSub||(c.__jstorage_meta.PubSub=[]);c.__jstorage_meta.PubSub.unshift([+new Date,a,b]);w();v()},reInit:function(){C()},noConflict:function(a){delete window.$.jStorage;a&&(window.jStorage=this);return this}};(function(){var a=!1;if("localStorage"in
window)try{window.localStorage.setItem("_tmptest","tmpval"),a=!0,window.localStorage.removeItem("_tmptest")}catch(b){}if(a)try{window.localStorage&&(h=window.localStorage,f="localStorage",r=h.jStorage_update)}catch(c){}else if("globalStorage"in window)try{window.globalStorage&&(h="localhost"==window.location.hostname?window.globalStorage["localhost.localdomain"]:window.globalStorage[window.location.hostname],f="globalStorage",r=h.jStorage_update)}catch(k){}else if(g=document.createElement("link"),
g.addBehavior){g.style.behavior="url(#default#userData)";document.getElementsByTagName("head")[0].appendChild(g);try{g.load("jStorage")}catch(d){g.setAttribute("jStorage","{}"),g.save("jStorage"),g.load("jStorage")}a="{}";try{a=g.getAttribute("jStorage")}catch(m){}try{r=g.getAttribute("jStorage_update")}catch(e){}h.jStorage=a;f="userDataBehavior"}else{g=null;return}D();x();"localStorage"==f||"globalStorage"==f?"addEventListener"in window?window.addEventListener("storage",u,!1):document.attachEvent("onstorage",
u):"userDataBehavior"==f&&setInterval(u,1E3);E();"addEventListener"in window&&window.addEventListener("pageshow",function(a){a.persisted&&u()},!1)})()});
execute_script("dAmnHelper_Script", dAmnHelper_Script);
execute_script("dAmnGoodies_Script", dAmnGoodies_Script);
