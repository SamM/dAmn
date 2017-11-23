// ==UserScript==
// @name           dAmnGoodies
// @description    Novelty features for dAmn chat.
// @author         Sam Mulqueen <sammulqueen.nz@gmail.com>
// @version        3.3.1
// @include        http://chat.deviantart.com/chat/*
// @include        https://chat.deviantart.com/chat/*
// @grant GM_xmlhttpRequest
// ==/UserScript==

function dAmnGoodies_Script(){
  var DG = {};
  window.DG = DG;

  DG.version = "3.3.1";

  DG.goodies = {};
  DG.Goodie = function(name, defaultData, setup){
    DG.goodies[name] = typeof DG.goodies[name] == "object" ? DG.goodies[name]:typeof defaultData == "object"?defaultData:{};
    var newData;
    if(typeof setup == "function"){
      try{
        newData = setup.call(this, DG.goodies[name], name);
      }catch(ex){
        console.error("dAmnGoodies Error (goodies_setup) : "+ex.message);
      }
    }
    if(typeof newData == "object"){
      DG.goodies[name] = newData;
    }
  };

  DG.save = function(){
    try{
      localStorage.setItem("dAmnGoodies3", JSON.stringify(DG.goodies));
    }catch(ex){
      console.error("dAmnGoodies Error (save_goodies) : "+ex.message);
    }
    return DG;
  };

  DG.load = function(){
    var loaded;
    try{
      loaded = localStorage.getItem("dAmnGoodies3");
    }catch(ex){
      console.error("dAmnGoodies Error (load_goodies) : "+ex.message);
    }
    try{
      if(!loaded){
        loaded = {};
      }else{
        loaded = JSON.parse(loaded);
      }
      DG.goodies = loaded;
    }catch(ex){
      DG.goodies = {};
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
        if(DG.goodies.safe && DG.goodies.safe.count) return;
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
          try{
            event.args[2] = toMessedUp(event.args[2]);
          }catch(ex){
            console.error("dAmnGoodies Error (drunk.Send): ", ex);
          }
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
      qt.skip = false;
      qt.add = function(user){
        var list = [];
        try{
          qt.tablist.forEach(function(name, i){
            if(i<20 && name.toLowerCase() != user.toLowerCase()){
              list.push(name);
            }
          });
          list.unshift(user);
          qt.tablist = list;
          settings.tablist = list;
          DG.save();
        }catch(ex){
          console.error("dAmnGoodies Error (quicktab.add): ", ex);
        }
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
        try{
          var user = event.args[0],
          text = event.args[1];
          if(user != dAmn_Client_Username){
            if(text.toLowerCase().search(dAmn_Client_Username.toLowerCase())>-1){
              DG.quicktab.add(user);
            }
          }
        }catch(ex){
          console.error("dAmnGoodies Error (QuickTab.onMsg): ",ex);
        }
      }
      dAmn.chat.events.onMsg(findTab);
      dAmn.chat.events.onAction(findTab);
      dAmn.event.listen("dAmnChatInput.prototype.onKey", function(event){
        if(!settings.enabled) return;
        try{
          var e = event.args[0];
          var kc = event.args[1];
          var force = event.args[2];
          var el = this.chatinput_el;
          var qt = DG.quicktab;
          if(kc == 9){
            if (e.ctrlKey || e.shiftKey) {
                dAmnChatTabs_activateNext();
                event.preventDefault();
                event.returnValue = false;
            }
            if(!this.tablist){
              var tabstart = el.value.lastIndexOf(' ') + 1;
              var tabstr = el.value.substr( tabstart );
              if (tabstr.length) {
                var a;
                if (tabstr.charAt(0) != '/') {
                  a = this.cr.members.MatchMembers( RegExp( '^'+tabstr+'\\S*', "i" ) );
                  if (0==tabstart) {
                    var i = a.length;
                    while (i--) {
                      a[i]+=': ';
                    }
                  }
                }
                if (a.length == 1) {
                  qt.skip = true;
                }
              }
            }
            if(el.value == "" || (el.value.slice(-1) == " ")){
              if(qt.tablist.length && qt.tabindex > -1){
                qt.tabindex++;
                qt.tabindex%=qt.tablist.length;
                el.value = el.value.slice(0,qt.tabstart)+qt.tablist[qt.tabindex]+(qt.tabstart===0?": ":" ");
                event.preventDefault();
                event.returnValue = false;
              }else{
                if(!this.tablist && !qt.skip){
                  qt.tabstart = el.value.lastIndexOf(" ")+1;
                  qt.tabindex = 0;
                  if(qt.tablist.length){
                    el.value = el.value.slice(0,qt.tabstart)+qt.tablist[qt.tabindex]+(qt.tabstart>0?" ":": ");
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
            qt.skip = false;
          }
        }catch(ex){
          console.error("dAmnGoodies Error (quicktab.onKey): ", ex);
        }
      });

      dAmn.chat.events.Send(function(event){
        if(!settings.enabled) return;
        if(event.args[0]!="msg") return;
        try{
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
        }catch(ex){
          console.error("dAmnGoodies Error (quicktab.Send): ", ex);
        }
      });
    });

    new DG.Goodie("swap", {
      enabled: true,
      pairs: {
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
          try{
            var msg = " "+event.args[2]+" ";
            for(var word in settings.pairs){
              /*
              re = new RegExp("\\s"+DG.escapeRegExp(word)+"\\s", "g");
              if(msg.search(re) > -1){
                msg = msg.replace(re, " "+settings.pairs[word]+" ");
              }
              */
              msg = msg.split(word).join(settings.pairs[word]);
            }
            event.args[2] = msg.slice(1,-1);
          }catch(ex){
            console.error("dAmnGoodies Error (swap.Send): ", ex);
          }
        }
      });
    });

    new DG.Goodie("nick", {
      enabled: true,
      tagsEnabled: false,
      sendEnabled: true,
      nicknames: {
        sumopiggy: "Sam"
      }
    }, function(settings){
      if(typeof settings.sendEnabled == "undefined"){
        settings.sendEnabled = true;
        DG.save();
      }
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
          case "send":
            if(split[1] == "on"){
              settings.sendEnabled = true;
              dAmn.chat.notice("dAmn Goodies will alter the messages you send to replace nicknames");
              DG.save();
            }else if(split[1] == "off"){
              settings.sendEnabled = false;
              dAmn.chat.notice("dAmn Goodies will NOT alter the messages you send to replace nicknames");
              DG.save();
            }else{
              dAmn.chat.notice("Usage: /nick send [on|off]");
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
        if(!settings.sendEnabled) return;
        if(event.args[0]!="msg"&&event.args[0]!="action") return;
        if(settings.enabled){
          try{
            var msg = event.args[2];
            for(var user in settings.nicknames){
              re = new RegExp("\\b"+DG.escapeRegExp(user)+"\\b", "gi");
              if(msg.search(re) > -1){
                msg = msg.replace(re, "<abbr title=\""+user+"\">"+settings.nicknames[user]+"</abbr>");
              }
            }
            event.args[2] = msg;
          }catch(ex){
            console.error("dAmnGoodies Error (nicknames.Send): ", ex);
          }
        }
      });

      dAmn.chat.events.onMsg(function(event){
        if(!settings.enabled) return;
        if(!settings.tagsEnabled) return;
        try{
          var username = event.args[0].toLowerCase();
          if(settings.nicknames[username]){
            event.args[0] = "<abbr title=\""+event.args[0]+"\">"+settings.nicknames[username]+"</abbr>";
          }
        }catch(ex){
          console.error("dAmnGoodies Error (Nicknames.onMsg): ",ex);
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
          try{
            var ns = this.cr.ns.toLowerCase().replace("chat:","");
            if(settings.exceptions.indexOf(ns) == -1){
              setTimeout(function(){
                dAmn.send.join(this.cr.ns);
              }, settings.delay*1000)
            }
          }catch(ex){
            console.error("dAmnGoodies Error (antikick.onSelfEvent): ", ex);
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
          try{
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
          }catch(ex){
            console.error("dAmnGoodies Error (autojoin.onSelfEvent): ", ex);
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
      try{
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
      }catch(ex){
        console.error("dAmnGoodies Error (multi.command): ", ex);
      }
    });

    dAmn.command("boot", 1, function(args){
      try{
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
      }catch(ex){
        console.error("dAmnGoodies Error (boot.command): ", ex);
      }
    });

    new DG.Goodie("notify", {enabled: true, sound_url: "http://soundbible.com/grab.php?id=2156&type=wav"}, function(settings){
      DG.notification_sound = new Audio(settings.sound_url);

      dAmn.command("notify", 1, function(args){
        var split = args.split(" ");
        switch(split[0]){
          case "on":
          case "off":
            DG.standardToggle(settings, args, "Sound notifications enabled.", "Sound notifications disabled.");
            break;
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
        try{
          var hilite = event.args[1];
          if(hilite === 2 && (!document.hasFocus() || dAmn.chat.getActive() != event.args[0])){
            DG.notification_sound.pause();
            DG.notification_sound.currentTime = 0;
            DG.notification_sound.play();
          }
        }catch(ex){
          console.error("dAmnGoodies Error (notify.newData): ", ex);
        }
      })

    });

    new DG.Goodie("youtube", {enabled: true}, function(settings){
      DG.youtube = {};
      DG.youtube.videos = {};
      DG.youtube.onPlayerReady = function(event){};
      DG.youtube.onPlayerStateChange = function(event){};
      DG.youtube.loadVideo = function(elId){
        try{
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
        }catch(ex){
          console.error("dAmnGoodies Error (youtube.loadVideo): ", ex);
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
      try{
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }catch(ex){
        console.error("dAmnGoodies Error (youtube.iframe_api): ", ex);
      }

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
        try{
          var player = document.createElement("div");
          player.id = "youtube."+id+"."+(new Date()).getTime();
          chatroom.channels.main.addDiv(player, null, 0);
          DG.youtube.videos[player.id] = null;
          DG.youtube.loadVideo(player.id);
        }catch(ex){
          console.error("dAmnGoodies Error (youtube.embedPlayer): ", ex);
        }
      };

      function doYouTube(event){
        if(settings.enabled){
          try{
            var msg = event.args[1];
            var ytid = DG.youtube.getYoutubeId(msg);
            if(ytid){
              var chatroom = this;
              var ns = this.cr.ns;
              event.after(function(){
                try{
                  DG.youtube.embedYouTubePlayer(ns, ytid);
                  chatroom.scroll_once = true;
                  dAmn_InvalidateLayout();
                }catch(ex){
                  console.error("dAmn Goodies Error (Youtube after onMsg): ", ex);
                }
              });
            }
          }catch(ex){
            console.error("dAmnGoodies Error (Youtube.onMsg): ",ex);
          }
        }
      }

      dAmn.chat.events.onMsg(doYouTube);
      dAmn.chat.events.onAction(doYouTube);

    });

    new DG.Goodie("colors", {enabled: true, name: false, msg: false, hilite: {name:false,msg:false,bg:false}, enableOthers: true, enableSelf: true}, function(settings){
      var match_color_tablump = /&abbr\tcolors:([A-Fa-f0-9]{6}):([A-Fa-f0-9]{6})\t/;
      var match_color_tag = /<abbr title="colors:([A-Fa-f0-9]{6}):([A-Fa-f0-9]{6})">/;
      var default_color = "393d3c";

      if(!settings.hilite){
        settings.hilite = {name:false, msg: false, bg: false};
        DG.save();
      }
      if(typeof settings.enableOthers == "undefined"){
        settings.enableOthers = true;
        DG.save();
      }
      if(typeof settings.enableSelf == "undefined"){
        settings.enableSelf = true;
        DG.save();
      }

      dAmn.command("colors", 1, function(args){
        var split = args.split(" ");
        switch(split[0]){
          case "on":
          case "off":
            DG.standardToggle(settings, args, "Custom message colors enabled.", "Custom message colors disabled.");
            break;
          case "toggle":
            switch(split[1]){
              case "others":
                settings.enableOthers = !settings.enableOthers;
                DG.save();
                dAmn.chat.notice(settings.enableOthers?"Enabled colors in other people's messages.":"Disabled colors in other people's messages.");
                break;
              case "self":
                settings.enableSelf = !settings.enableSelf;
                DG.save();
                dAmn.chat.notice(settings.enableSelf?"Enabled colors for your messages.":"Disabled colors for your messages.");
                break;
              default:
                dAmn.chat.notice("Usage: /colors toggle [others|self]");
                break;
            }
            break;
          case "none":
          case "reset":
            settings.name = false;
            settings.msg = false;
            DG.save();
            dAmn.chat.notice("Reset colors to default style.");
            break;
          case "name":
          case "msg":
            if(!split[1]){
              dAmn.chat.notice("Usage: /colors "+split[0]+" #FF0000 (This sets the color to red)");
              return;
            }
            color = split[1].replace("#", "");
            if(color == "none" || color == "reset"){
              dAmn.chat.notice("Reset color to default for your "+(split[0]=="name"?"username":"message"));
              settings[split[0]] = false;
              DG.save();
              return;
            }
            if(color.length != 6){
              dAmn.chat.notice("Usage: /colors "+split[0]+" #FF0000 (This sets the color to red)");
              return;
            }
            settings[split[0]] = color;
            DG.save();
            dAmn.chat.notice("Set color for your "+(split[0]=="name"?"username":"message")+" to <b style=\"color:#"+color+"\">#"+color+"</b>");
            break;
          case "hilite":
          case "hilight":
            if(!split[1]){
              dAmn.chat.notice("Usage: /colors "+split[0]+" [name|msg|bg|none]");
              return;
            }
            switch(split[1]){
              case "name":
              case "msg":
              case "bg":
                if(!split[2]){
                  dAmn.chat.notice("Usage: /colors "+split[0]+" "+split[1]+" #FF0000 (This sets the color to red)");
                  return;
                }
                color = split[2].replace("#", "");
                if(color == "none" || color == "reset"){
                  dAmn.chat.notice("Reset color to default for hilite "+(split[1]=="name"?"username":split[1]=="msg"?"message":"background"));
                  settings.hilite[split[1]] = false;
                  DG.save();
                  return;
                }
                if(color.length != 6){
                  dAmn.chat.notice("Usage: /colors "+split[0]+" "+split[1]+" #FF0000 (This sets the color to red)");
                  return;
                }
                settings.hilite[split[1]] = color;
                DG.save();
                dAmn.chat.notice("Set color for hilite "+(split[1]=="name"?"username":split[1]=="msg"?"message":"background")+" to <b style=\"color:#"+color+"\">#"+color+"</b>");
                break;
              case "none":
              case "reset":
                settings.hilite = {name:false, msg:false, bg: false};
                DG.save();
                dAmn.chat.notice("Removed custom formatting for hilites.");
                break;
              case "show":
              case "preview":
                dAmn.chat.notice("Preview: <span style=\"background-color:#"+(settings.hilite.bg?settings.hilite.bg:"")+"\"> <b style=\"color:"+(settings.hilite.name?"#"+settings.hilite.name:"")+"\">&lt;Username&gt;</b> <span style=\"color:"+(settings.hilite.msg?"#"+settings.hilite.msg:"")+"\">Example of message text</span> </span>");
                break;
              default:
                dAmn.chat.notice("Usage: /colors "+split[0]+" [name|msg|bg|none]");
                break;
            }
            break;
          case "show":
            dAmn.chat.notice("Your name is set to <b style=\"color:#"+settings.name+"\">#"+settings.name+"</b>, your message color is set to <b style=\"color:#"+settings.msg+"\">#"+settings.msg+"</b>")
            break;
          default:
            dAmn.chat.notice("Usage: /colors [on|off|none|name|msg|show]");
            break;
        }
      });

      function doColors(event){
        if(!settings.enabled) return;
        try{
          var el = event.args[0];
          var msg = el.innerHTML;
          var index=msg.indexOf("<abbr title=\"colors:");
          var hilite = [].slice.call(el.classList).indexOf("other-hl")>-1;
          var self_msg = [].slice.call(el.classList).indexOf("self-hl")>-1;
          var text = el.getElementsByClassName("text")[0];
          var from = el.getElementsByClassName("from")[0];
          if(!from || !text) return;
          var spans = [].slice.call(text.getElementsByTagName("span"));
          var links = [].slice.call(text.getElementsByTagName("a"));
          if(!(!settings.enableOthers && !self_msg)){
            if(index>-1){
              var colors = match_color_tag.exec(msg);
              from.style.color = "#"+colors[1];
              text.style.color = "#"+colors[2];
            }
          }
          if(hilite){
            if(settings.hilite.bg){
              el.style.backgroundColor = "#"+settings.hilite.bg;
              from.children[0].style.backgroundColor = "#"+settings.hilite.bg;
              spans.forEach(function(span){
                span.style.backgroundColor = "#"+settings.hilite.bg;
              });
            }
            if(settings.hilite.name){
              from.style.color = "#"+settings.hilite.name;
            }
            if(settings.hilite.msg){
              text.style.color = "#"+settings.hilite.msg;
              links.forEach(function(span){
                span.style.color = "#"+settings.hilite.msg;
              });
            }
          }
        }catch(ex){
          console.error("dAmnGoodies Error (colors.addDiv): ", ex);
        }
      }

      dAmn.event.listen("dAmnChanChat.prototype.addDiv", doColors);

      dAmn.chat.events.Send(function(event){
        if(!settings.enabled) return;
        if(!settings.enableSelf) return;
        if(DG.goodies.safe && DG.goodies.safe.count) return;
        if(!settings.name && !settings.msg) return;
        if(event.args[0]!="msg"&&event.args[0]!="action") return;
        try{
          var name = settings.name?settings.name:default_color;
          var msg = settings.msg?settings.msg:default_color;
          event.args[2] += "<abbr title=\"colors:"+name.toUpperCase()+":"+msg.toUpperCase()+"\"></abbr>";
        }catch(ex){
          console.error("dAmnGoodies Error (colors.Send): ", ex);
        }
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
        try{
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
        }catch(ex){
          console.error("dAmnGoodies Error (stylesheets.checkTitle): ", ex);
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
        try{
          var pkt = event.args[0];
          if(pkt.cmd == "property" && pkt.args.p == "title"){
            if(pkt.param == dAmn.chat.getActive()){
              checkTitle(dAmn.chat.getTitle());
            }
          }
        }catch(ex){
          console.error("dAmnGoodies Error (stylesheets.onEvent): ", ex);
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

    DG.request = {};
    DG.request.url = null;
    DG.request.callback = null;

    dAmn.command("stalk", 1, function(args){
      var username = args;
      DG.request.url = "http://"+username+".deviantart.com";
      DG.request.callback = function(error, response){
        if(error){
          console.error(error);
        }else{
          try{
            var profile = document.implementation.createHTMLDocument("profile");
            profile.documentElement.innerHTML = response;
            var user_info = profile.body.getElementsByClassName("super-secret-why-short")[0];
            var user_info_spans = user_info.getElementsByTagName("span");
            var name_etc = user_info_spans[3].innerHTML;
            var output = [];
            var name = name_etc.split(">")[1].split("<")[0];
            output.push(name);
            var asl = name_etc.split("</strong>")[1];
            while(asl.slice(-1) == " "){
              asl = asl.slice(0,-1);
            }
            output.push(asl);
            var artist_type_etc = user_info_spans[2].getElementsByTagName("strong");
            [].slice.call(artist_type_etc).forEach(function(el){
              if(el.innerText && el.innerText != " ") output.push(el.innerText);
            })
            var output_str = output.join(", ");
            dAmn.chat.notice(username+": "+output.join(", "), 7);
          }catch(ex){
            console.error("dAmn Goodies Error (stalk): "+ex);
          }
        }
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
      try{
        var original = window;
        var path = method.split(".");
        path.forEach(function(step){
          original = original[step];
        });
        if(typeof original == "function" && typeof dAmn.replaced[method] == "undefined"){
          dAmn.original[method] = original;
          dAmn.replaced[method] = function(){
            try{
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
                    try{
                      fn.call(this, methodReturn);
                    }catch(ex){
                      console.error("dAmn Helper Error (event.hook.after): "+ex);
                    }
                  });
                }
              }
              if(typeof this == "function" || path[1] == "prototype"){
                return (typeof event.returnValue == "undefined") ? methodReturn : event.returnValue;
              }
            }catch(ex){
              console.error("dAmn Helper Error (event.replacedMethod): "+ex);
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
      }catch(ex){
        console.error("dAmn Helper Error (event.hook): "+ex);
      }
    };
    dAmn.event.listeners = {};
    dAmn.event.emit = function(method){
      try{
        if(Array.isArray(dAmn.event.listeners[method])){
          var args = Array.prototype.slice.call(arguments, 1);
          var listeners = dAmn.event.listeners[method];
          for(var i=0; i<listeners.length; i++){
            listeners[i].apply(this, args);
          }
        }
      }catch(ex){
        console.error("dAmn Helper Error (event.emit): "+ex);
      }
    };
    dAmn.event.listen = function(method, handler){
      try{
        if(!Array.isArray(dAmn.event.listeners[method])){
          dAmn.event.listeners[method] = [];
        }
        dAmn.event.hook(method);
        dAmn.event.listeners[method].push(handler);
      }catch(ex){
        console.error("dAmn Helper Error (event.listen): "+ex);
      }
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

    try{
      for(var m in methods){
        dAmn.chat.events[m] = (function(method){
          return function(handler){
            return dAmn.event.listen(method, handler);
          };
        })(methods[m]);
      }
    }catch(ex){
      console.error("dAmn Helper Error (chat.events.listen): "+ex);
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
      try{
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
          try{
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
          }catch(ex){
            console.error("dAmn Helper Error (command.onKey): "+ex);
          }
        });
      }catch(ex){
        console.error("dAmn Helper Error (command): "+ex);
      }
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
      try{
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
      }catch(ex){
        console.error("dAmn Helper Error (chat.get): "+ex);
      }
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
execute_script("dAmnHelper_Script", dAmnHelper_Script);
execute_script("dAmnGoodies_Script", dAmnGoodies_Script);

// HttpRequests Workaround

var requestInterval = null;
var $w = unsafeWindow;
function checkRequests(){
  if($w.DG && $w.DG.request && $w.DG.request.url && $w.DG.request.callback){
    var url = $w.DG.request.url;
    var callback = $w.DG.request.callback;
    $w.DG.request.url = null;
    $w.DG.request.callback = null;
    var xhr = new GM_xmlhttpRequest({
      method: "GET",
      url: url,
      onload: function(xhr){
        if(xhr.readyState === 4){
          if(xhr.status === 200){
            callback(null, xhr.responseText);
          }else{
            callback(xhr.statusText);
          }
        }
      },
      onerror: function(xhr){
        callback(xhr.statusText);
      }
    });
  }
}

requestInterval = setInterval(checkRequests, 500);
