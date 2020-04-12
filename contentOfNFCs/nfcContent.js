export var routerCommand = 'Name: OpenWRT Router\
  Connectivity:SSH user:root host:192.168.1.1 password:admin num_of_devices_paired:0 devices_paired_id:None dp_pass:None<html>\
    <body> <h1 class=\'title\'> OpenWRT Router </h1>\
        <script>\
            function getNewSSID() {\
              return document.getElementById(\'newssid\').value;}\
            function getNewPass() {\
              return document.getElementById(\'newpass\').value;}\
            function changeSSID (){\
            if (getNewSSID() != \'\'){\
                document.getElementById(\'ssid\').innerHTML = getNewSSID();\
                window.ReactNativeWebView.postMessage(\"uci set wireless.@wifi-iface[0].ssid=\'\"+ getNewSSID() +\"\' \\nuci commit wireless\");\
                alert(\"The router needs to restart for your changes to take effect. Restart manually or click the reboot button below.\");}\
            }\
            function changePass (){\
                if (getNewPass() != \'\'){\
                window.ReactNativeWebView.postMessage(\"uci set wireless.@wifi-iface[0].key=\'\"+ getNewPass() +\"\' \\nuci commit wireless\");\
                alert(\"The router needs to restart for your changes to take effect. Restart manually or click the reboot button below.\");}}\
            function rebootMe(){\
              window.ReactNativeWebView.postMessage("reboot");\
              alert("The router will reboot now. Go to your phone settings to reconnect.")\
            }\
        </script>\
        <div class=\'change-ssid\'>\
            <div class=\'ssid\'>\
                <h1 class=\'ssid-title\'>Router\'s SSID: </h1>\
                <span id=\'ssid\' class=\'actual-ssid\'>$uci get wireless.@wifi-iface[0].ssid$</span>\
            </div>\
            <div class=\'change-input\'>\
                <h2>Change SSID:</h2>\
                <form>\
                    <label id=\'id1\' for=\'newssid\'>SSID: </label>\
                    <input id=\'newssid\' type=\'text\' placeholder=\'Enter new SSID here\'>\
                    <button class="chng" type="button" onclick="changeSSID()"> Apply </button>\
                </form>\
                <form>\
                    <label id=\'id2\' for=\'newpass\'>Password: </label>\
                    <input id=\'newpass\' type=\'password\' placeholder=\'Enter new password here\'>\
                    <button class="chng" type="button" onclick="changePass()"> Apply </button>\
                </form>\
            </div>\
            <div class=\'change-input\'>\
                <h2>Reboot the Router</h2>\
                <p> This will automatically close the app and restart your router. Go to Settings to reconnect.</p>\
                <button class="rbt" type="button" onclick="rebootMe()">  REBOOT </button>\
            </div>\
        </div>\
        <div class=\'connected-devices\'>\
            <h1 class=\'connected-devices-title\'>Connected Devices</h1>\
        		<div class=\'connected-devices-table\'>\
                <table>$cd ..\n/etc/config/show_wifi_clients.sh$</table>\
            </div>\
        </div>\
        <div class=\'routing-table\'>\
            <h1 class=\'routing-table-title\'>Routing Table </h1>\
            <div class=\'routing-table-table\'>\
            <table>$ip r$</table>\
            </div>\
        </div>\
        <div class=\'network-traffic\'>\
            <h1 class=\'network-traffic-title\'>Network Traffic</h1>\
            <p class=\'network-traffic-contents\'>$vnstat -i br-lan$</p>\
        </div>\
    </body>\
    <style>\
        body {\
            font-family: Helvetica;\
            color: white;\
            background-color:rgb(12, 12, 12);\
            opacity: 1;\
            animation: fade 2s linear;\
        }\
        @keyframes fade {\
            0% {opacity:0}\
            50% {opacity:1}\
        }\
        h1.title {\
            border-radius: 25px;\
            text-align: center;\
            font-size:5em;\
            background-color: #191919;\
            margin-right: 20px;\
            margin-left: 20px;\
            padding-top: 50px;\
            padding-bottom: 50px;\
            color:white;\
            margin-top:100px;\
        }\
        h1.headers {\
            display:inline;\
            font-size:2.5em;\
        }\
      	.change-ssid {\
            margin-left: 20px;\
            margin-right: 20px;\
            background-color: #242424;\
            border-radius: 25px;\
            padding: 20px;\
      	}\
        div.ssid {\
            font-size: 20px;\
            text-align: center;\
            background-color: #141414;\
            padding-top: 15px;\
            padding-bottom: 15px;\
            border-radius: 25px;\
        }\
        h1.ssid-title {\
            display: inline-block;\
        }\
        span.actual-ssid {\
            color: rgb(50, 145, 189);\
         		font-size: 35px;\
        }\
      	h1.headers {\
      	    margin-left: 30px;\
          font-size: 30px;\
      	}\
      	p {\
      		margin-left: 30px;\
          font-size: 19px;\
      	}\
      	h2 {\
      		font-size: 30px;\
      	}\
        button.rbt{\
          background-color: rgb(16, 54, 71);\
          color: white;\
          padding: 14px 20px;\
          margin: 8px 0;\
          border: none;\
          border-radius: 20px;\
          cursor: pointer;\
          font-size: 20px;\
          width: 95%;\
          height: 60px;\
        }\
        .change-input {\
            margin-top: 15px;\
            padding-left: 30px;\
            font-size: 15px;\
            background-color: #191919;\
            padding-top: 15px;\
            padding-bottom: 15px;\
            border-radius: 25px;\
        }\
      	label {\
            font-size: 20px;\
            padding-right: 10px;\
        }\
        input[type=text], select {\
            padding: 12px 20px;\
            margin-bottom: 5px;\
            display: inline-block;\
            border: 1px solid #ccc;\
            border-radius: 25px;\
            margin-left: 38px;\
            margin-right: 23px;\
            box-sizing: border-box;\
        }\
        input[type=password], select {\
            padding: 12px 20px;\
            margin: 8px 0;\
            display: inline-block;\
            border: 1px solid #ccc;\
            border-radius: 25px;\
            box-sizing: border-box;\
            margin-right: 20px;\
        }\
        input[type=button] {\
            background-color: rgb(16, 54, 71);\
            color: white;\
            padding: 14px 20px;\
            margin: 8px 0;\
            border: none;\
            border-radius: 20px;\
            cursor: pointer;\
        }\
        button.chng {\
          background-color: rgb(16, 54, 71);\
          color: white;\
          padding: 14px 20px;\
          margin: 8px 0;\
          border: none;\
          border-radius: 20px;\
          cursor: pointer;\
          font-size: 20px;\
        }\
      	input[type=button]:active {\
            background-color: rgb(30, 84, 109);\
        }\
        .connected-devices {\
            margin-right: 20px;\
            margin-left: 20px;\
            background-color: #242424;\
            border-radius: 25px;\
            margin-top: 20px;\
          	padding-bottom: 1px;\
            padding-top: 1px;\
        }\
      	.connected-devices-title {\
            padding-left: 30px;\
            font-size: 30px;\
            background-color: #141414;\
            padding-top: 15px;\
            padding-bottom: 15px;\
            border-radius: 25px;\
            margin: 20px;\
      	}\
      	.connected-devices-table {\
            padding-left: 30px;\
            background-color: #191919;\
            padding: 20px;\
            border-radius: 25px;\
            margin: 20px;\
      	}\
        table {\
            width: 100%;\
            border-collapse:separate;\
            border:solid gray 1px;\
            border-radius:25px;\
            -moz-border-radius:25px;\
            font-size: 20px;\
        }\
        td, th {\
            border-left:solid grey 1px;\
            border-top:solid grey 1px;\
            padding: 15px;\
        }\
        th {\
            background-color: rgb(92, 92, 92);\
            border-top: none;\
        }\
        th.ip_address {\
            border-radius: 22px 0px 0px;\
        }\
        th.mac_address {\
            border-radius: 0px 22px 0px 0px;\
        }\
        td:first-child, th:first-child {\
            border-left: none;\
        }\
        .routing-table {\
        	background-color: #242424;\
            border-radius: 25px;\
            padding: 2px;\
            margin: 20px;\
        }\
        .routing-table-title {\
            padding-left: 30px;\
            font-size: 30px;\
            background-color: #141414;\
            padding-top: 15px;\
            padding-bottom: 15px;\
            border-radius: 25px;\
            margin: 20px;\
        }\
        .routing-table-table {\
            padding-left: 30px;\
            background-color: #191919;\
            padding: 20px;\
            border-radius: 25px;\
            margin: 20px;\
        }\
        .network-traffic {\
        	background-color: #242424;\
            border-radius: 25px;\
            padding: 2px;\
            margin: 20px;\
        }\
        .network-traffic-title {\
            padding-left: 30px;\
            font-size: 30px;\
            background-color: #141414;\
            padding-top: 15px;\
            padding-bottom: 15px;\
            border-radius: 25px;\
            margin: 20px;\
        }\
        .network-traffic-contents {\
            background-color: #191919;\
            padding: 20px;\
            border-radius: 25px;\
            margin: 20px;\
            font-size: 20px;\
        }\
    </style></html>'
