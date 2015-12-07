

// ==UserScript==
// @name           dAmn Less Hilights
// @description    Cancels hilighting for part, disconnect & shutdown
// @author         Sam Mulqueen <sammulqueen.nz@gmail.com>
// @version        1.0.0
// @include        http://chat.deviantart.com/chat/*
// ==/UserScript==

function DLH(){
  function makeChanges(){
    var old_fn = dAmnChanChat.prototype.makeText;
    dAmnChanChat.prototype.makeText = function( style, from, input_text, hilite ){
      if(["shutdown", "disconnect", "part"].indexOf(style)>-1){
        hilite = 0;
      }
      this.DLHmakeText( style, from, input_text, hilite );
    }
    dAmnChanChat.prototype.DLHmakeText = old_fn;
  }

  DWait.ready(['jms/pages/chat07/chatpage.js', 'jms/pages/chat07/dAmn.js', 'jms/pages/chat07/dAmnChat.js'], function() {
		makeChanges();
	});
}

function execute_script(script, id){
	var el = document.createElement('script');
	if(id) el.id = id;
	el.appendChild(document.createTextNode(script));
	document.getElementsByTagName("head")[0].appendChild(el);
	return el;
}
execute_script("("+DLH.toString()+")()", "dAmnLessHilights");
