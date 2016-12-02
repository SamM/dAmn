// ==UserScript==
// @name           dAmn Collective Drawing
// @description    Draw alongside other Deviants right from within dAmn
// @author         Sam Mulqueen <sammulqueen.nz@gmail.com>
// @version        0.0.1
// @include        http://chat.deviantart.com/chat/*
// ==/UserScript==

function DCDScript(){

  var dAmn = {};
  window.dAmn = dAmn;

  dAmn.original = {};
  dAmn.overide = {};

  var dAmn_methods = [
    "dAmn_superdAmn_detect", "dAmn_ChatPage_init", "dAmn_Init",
    "dAmn_AddLogCB", "dAmn_RemLogCB", "dAmn_Connect",
    "dAmn_Login", "dAmn_Logoff", "dAmn_Rem_dAmnCB",
    "dAmn_Add_dAmnCB", "dAmn_Join", "dAmn_Part", "dAmn_Send",
    "dAmn_GetAttention", "dAmn_Raw", "dAmn_Set", "dAmn_Get",
    "dAmn_Kick", "dAmn_Kill", "dAmn_ParseArgsNData",
    "dAmn_ParsePacket", "dAmn_ExceptionPrint",
    "dAmn_arrayRemoveIndex", "dAmn_arrayFindValue",
    "dAmn_arrayAddUnique", "dAmn_arrayRemValue",
    "dAmn_arrayForEach", "dAmn_objForEach",
    "dAmn_objForEachString", "dAmn_objCount",
    "dAmn_stringIEqual", "dAmn_print2Digits",
    "dAmn_printDate", "dAmn_printElapsedTime",
    "dAmn_printElement", "dAmn_doInsertAdjacentHTML",
    "dAmn_StringizePacket", "dAmn_DeleteChildren",
    "dAmn_DeleteSelf", "dAmn_classMatch",
    "dAmn_findParentWClass", "dAmn_MakeEl", "dAmn_MakeDiv",
    "dAmn_MakeSpan", "dAmn_MakeTextInput", "dAmn_MakeButton",
    "dAmn_AddEl", "dAmn_InsertEl", "dAmn_AddDiv",
    "dAmn_AddSpan", "dAmn_AddNewEl", "dAmn_getOverflow",
    "dAmn_getDisplay", "dAmn_getPosition",
    "dAmn_getBorderBottomWidth", "dAmn_cursorToEnd",
    "dAmn_resizeFlexyRow", "dAmn_resizeFlexyCol",
    "dAmn_resizeInverted", "dAmn_noHTML", "dAmn_Plugin_Java",
    "dAmn_Plugin_XPCOM", "dAmn_Plugin_Flash",
    "dAmn_PluginObj", "dAmn_Plugin_jsPing_timeout",
    "dAmn_Plugin_jsWait_timeout", "dAmn_GetElement",
    "dAmn_AutoPos_ResizeEvent", "dAmn_Log", "dAmn_PopQueue",
    "dAmn_ProcessQueues", "dAmn_Command", "dAmn_Cmd",
    "dAmn_Command_TrySend", "dAmn_GenerateParsedPacket",
    "dAmn_Client_ReConnect", "dAmnFlash_DoFSCommand",
    "dAmnJava_DoCommand_real", "dAmnJava_DoCommand",
    "dAmn_DoCommand", "dAmnChat_Init", "dAmn_formatNS",
    "dAmn_format_pchat_ns", "dAmnChatbase_dAmnCB",
    "dAmnChat_Remove", "dAmnChatTabs_rem",
    "dAmnChatTabs_activate_active", "dAmnChatTabs_activate",
    "dAmnChatTabs_activateNext", "dAmnChatTabs_flashTab",
    "dAmnChatTabs_newData", "dAmn_InvalidateLayout",
    "dAmn_CalculateLayout", "dAmnChatbase_onResize",
    "dAmnChatbase_onResize_cb", "dAmnChatbase_onLog",
    "dAmnChatbase_imgbox_onclick",
    "dAmnChat_ImgBoxHover_enter", "dAmnChat_ImgBoxHover_exit",
    "dAmnChat_AddImgBox_Images", "dAmnChat_AddImgBox",
    "dAmnChatbase_onObjClose", "dAmnEscape", "dAmnChat",
    "dAmnChat_doRemove", "dAmnChat_onResize",
    "dAmnChat_onData", "dAmnChat_onClose",
    "dAmnChat_onDisconnect", "dAmnChat_onShutdown",
    "dAmnChat_Send", "dAmnChat_SetElement", "dAmnChatMembers",
    "dAmnChatMembers_SortMember",
    "dAmnChatMembers_MatchMembers",
    "dAmnChatMembers_ClearMembers",
    "dAmnChatMembers_AddMember", "dAmnChatMembers_DelMember",
    "dAmnChatMembers_MoveMember", "dAmnChatMembers_Refresh",
    "dAmnChat_onKey", "dAmnChatInput",
    "dAmnChatInput_toggleInput", "dAmnChatInput_onKey",
    "dAmnChatInput_setFocus", "dAmnChatInput_appendText",
    "dAmnChat_enterInfoCtr", "dAmnChat_leaveInfoCtr",
    "dAmn_printAvatar", "dAmnChatMember",
    "dAmnChatMember_updateInfo", "dAmnChatMember_updateHTML",
    "dAmnChat_EmbededMedia_OnClick", "dAmnChanChat",
    "dAmnChatbase_getTextNodesIn",
    "dAmnChatbase_returnwordwraped",
    "dAmnChatbase_updateAlerts", "dAmnChatbase_removeAlert",
    "dAmnChatbase_onHide", "dAmn_addTimedDiv",
    "dAmnChanMainChat", "dAmn_newRoomClick",
    "dAmn_Plugin_timeout"
  ];

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
    }
  }
  dAmn.event.listeners = {};
  dAmn.event.emit = function(method){
    if(Array.isArray(dAmn.event.listeners[method])){
      var args = Array.prototype.slice.call(arguments, 1);
      var listeners = dAmn.events.listeners[method];
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
  dAmn.chat.chatrooms = dAmnChats;
  dAmn.chat.tabs = dAmnChatTabs;
  dAmn.chat.stack = dAmnChatTabStack;
  dAmn.chat.getActive = function(returnObject){
    if(returnObject){
      return dAmn.chat.chatrooms[dAmnChatTab_active];
    }
    return dAmnChatTab_active;
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
