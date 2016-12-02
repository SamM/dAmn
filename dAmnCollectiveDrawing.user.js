// ==UserScript==
// @name           dAmn Collective Drawing
// @description    Draw alongside other Deviants right from within dAmn
// @author         Sam Mulqueen <sammulqueen.nz@gmail.com>
// @version        0.0.1
// @include        http://chat.deviantart.com/chat/*
// ==/UserScript==

function DCDScript(){
  console.log(window);
}

function execute_script(script, id){
	var el = document.createElement('script');
	if(id) el.id = id;
	el.appendChild(document.createTextNode(script));
	document.getElementsByTagName("head")[0].appendChild(el);
	return el;
}
execute_script("var DCD = window.DCD = ("+DCDScript.toString()+")();", "dAmnCollectiveDrawing_Script")
