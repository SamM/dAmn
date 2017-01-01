// ==UserScript==
// @name           dAmn.ws
// @namespace      botdom.com
// @description    Make the official client use WebSockets
// @author         Henry Rapley <photofroggy@gmail.com>
// @version        1.1.6
// @include        http://chat.deviantart.com/chat/*
// @include        http://chat.deviantart.lan/chat/*
// ==/UserScript==


var dAmnWebSocket = function(  ) {

    /**
     * WebSocket plugin object.
     * deviantART's dAmn client uses "Plugin" objects to implement different
     * kinds of transports. As such, this is an object which aims to satisfy
     * the interface expected by the client.
     */
    dAmn_Plugin_WebSocket = function() {
        this.name = 'WebSocket';
        this.objName = 'dAmnWebSocket';
        this.wsaddress = 'ws://frogpond.herokuapp.com';
        this.connectaddress = 'dAmn@frogpond.herokuapp.com';
        dAmn_Client_Agent+= ' (dAmn.ws/1.1.6)';

        /**
         * Execute a command on the plugin.
         * The given `cmd` object contains an argument and a command. The
         * command tells the plugin what it should be doing, and the arugment
         * is any additional information that may be required for the command
         * to work.
         */
        this.doCmd = (function( cmd ) {

            if( !cmd )
                return;

            switch( cmd.cmd ) {
                case 'init':
                    dAmn_Plugin.doCmd( 'connect' );
                    break;
                case 'connect':
                    // connect here...
                    dAmn_Plugin.log('Creating Websocket');
                    this.sock = new WebSocket(this.wsaddress);

                    this.sock.onopen = (function( event ) {
                        dAmn_Plugin.log('Proxy open');
                        dAmn_DoCommand( 'connect', this.connectaddress);
                    }).bind(this);

                    this.sock.onmessage = function( event ) {
                        dAmn_DoCommand( 'data', unescape(event.data.split('+').join(' ')) );
                    };

                    this.sock.onclose = function( event ) {
                        dAmn_Plugin.log('WebSocket closed');
                        dAmn_DoCommand( 'disconnect' );
                    };
                    break;
                case 'disconnect':
                    if( this.sock == null )
                        break;
                    this.sock.close();
                    break;
                case 'send':
                    if( this.sock == null )
                        break;
                    var p = dAmn_ParsePacket(cmd.arg);
                    if( p.cmd == 'login' ) {
                        if( p.param != 'login' ) {
                            dAmn_Client_Username = p.param;
                        } else {
                            dAmn_DoCommand('done');
                            return;
                        }
                    }
                    this.sock.send(escape(cmd.arg).split('+').join('%2B'));
                    break;
                case 'ping':
                    break;
            }

            dAmn_DoCommand('done');
        }).bind(this);

        /**
         * Load the plugin.
         * This seems to be used to load whatever plugin is used to manage the
         * transport, and is not used to initialise a connection of any sort.
         * In order for the client to work properly with this plugin object,
         * we may have to create an HTML element of some sort to trick the
         * client into thinking we are actually using something so silly.
         */
        this.load = function(  ) {
            if(!(window["WebSocket"])) {
                dAmn_Plugin.log( 'No Websockets Support' );
                return false;
            }

            this.loadCount++;
            dAmn_Plugin.log( 'Probing' );

            var d = new Date();
            this.begin_ts = d.getTime();

            dAmn_Client_PluginArea.innerHTML = '<div id="'+this.objName+'"></div>';
            document.dAmnWebSocket = {};
            dAmn_Plugin.getClientObj();
            this.sock = null;

            dAmn_DoCommand('init', 'init_arg');

            this.setTimer(1000);
        }

        /**
         * Check if we can access the plugin.
         * Because we're using WebSockets, just check if WebSockets are
         * implemented in the browser.
         */
        this.tryAccess = function(  ) {
            if(window["WebSocket"]) {
                return document.dAmnWebSocket;
            }
            return false;
        };

        /**
         * Make the client fall back to other transports if we can't use
         * WebSockets. If we can, then tell the client we are ready to connect.
         */
        this.timeout = function(  ) {
            if(!(window["WebSocket"])) {
                dAmn_Plugin.tryNext('Extension not supported');
                return false;
            }

            dAmn_Plugin.log("WebSocket timeout");

            if (dAmn_Plugin.clientObj ) {
                try {
                    dAmn_DoCommand('init', 'init_arg');
                } catch(e) {
                    dAmn_Plugin.tryNext("Extension failed: " + e);
                }
                return;
            }

            if(!dAmn_Plugin.clientObj)
            {
                if( dAmn_Plugin.state != 'noclient' )
                {
                    dAmn_Plugin.state = 'noclient'
                    // wait
                    dAmn_Plugin.setTimer( 100 );
                } else {
                    dAmn_Plugin.tryNext('Extension not installed');
                }
            } else {
                dAmn_Plugin.tryNext("Extension not responding");
            }

        };

    }

    /**
     * Inject the WebSocket plugin into the dAmn Init script
     * This function is idential to the original except it adds
     * the WebSocket to the plugin list
     */
    dAmn_Init = function( pluginarea, plugin, logfunc  )
    {
        if (Browser.isIE && !(document.documentMode > 7)) {
            alert("A newer version of Internet Explorer is required to use deviantART Chat.");
            return;
        }

        try{
            dAmn_Client_LogCallback = logfunc ;

            dAmn_Client_PluginArea    = dAmn_GetElement(pluginarea);
            dAmn_Client_PluginArea.style.width  ='0px';
            dAmn_Client_PluginArea.style.height ='0px';

            dAmn_Log( 'Browser: ' + navigator.userAgent );

            if ( !plugin  || plugin == 'default' ) {
                if (-1 != navigator.userAgent.search('Gecko')) {
                    dAmn_Plugins = {
                         begin:                   new dAmn_Plugin_WebSocket()
                        ,'WebSocket':             new dAmn_Plugin_XPCOM()
                        ,'Mozilla Extension':     new dAmn_Plugin_Flash()
                        ,Flash:                   new dAmn_Plugin_Java()
                    }
                } else  {
                    dAmn_Plugins = {     begin:       new dAmn_Plugin_WebSocket()
                                        ,'WebSocket':   new dAmn_Plugin_Flash()
                                        ,Flash:       new dAmn_Plugin_Java()
                                    }
                }
                dAmn_Log('Defaulting to '+dAmn_Plugins['begin'].name+' plugin');
            } else {
                switch( plugin ) {
                    case 'WebSocket':
                        dAmn_Plugins = { begin:    new dAmn_Plugin_WebSocket() };
                        break;
                    case 'XPCOM':
                        dAmn_Plugins = { begin:    new dAmn_Plugin_XPCOM() };
                        break;
                    case 'Flash':
                        dAmn_Plugins = { begin:    new dAmn_Plugin_Flash() };
                        break;
                    case 'Java':
                        dAmn_Plugins = { begin:    new dAmn_Plugin_Java() };
                        break;
                    default:
                        throw "invalid plugin";
                }
                dAmn_Log('Forced to '+dAmn_Plugins['begin'].name+' plugin');
            }

            dAmn_Plugin = new dAmn_PluginObj(dAmn_Plugins['begin']);
            dAmn_Plugin.load();

        }
        catch(e)
        {
            alert('dAmn_Init() failed! : ' + dAmn_ExceptionPrint(e));
        }
    }


    /**
     * Hijack the plugin in Chrome only, cause Chrome loads way after the Dom is loaded
     * While Firefox's Greasemonkey injects the script into the page at the right time
     */
    if (Browser.isChrome) {
        dAmn_Plugin = new dAmn_PluginObj(new dAmn_Plugin_WebSocket());
        dAmn_Plugin.load();
        dAmn_Client_ReConnect();
    }
};

var dwsel = document.createElement("script");
dwsel.id = "damnwebsocket"
dwsel.appendChild(document.createTextNode("(" + dAmnWebSocket.toString() + ")();"))
document.getElementsByTagName("head")[0].appendChild(dwsel)
