export var routerCommand =
  'Name: OpenWRT Router\
  Connectivity: SSH user:root host:192.168.1.1 password:admin num_of_devices_paired:0 devices_paired_id:None dp_pass:None<html>\
    <style> body {font-family: Helvetica;color: white;background-color:black; margin-top:150px; margin-left:35px;}\
    h1.title{text-align: center; font-size:5em;} h1.headers{display:inline; font-size:3em;}h2.sname{display: inline; font-size:3em;}\
    table {text-align: left;border: 2px solid gray;border-collapse: collapse;}\
    th {background-color:gray;color:white;padding: 15px;border-color: gray;}\
    td{color: white;padding: 15px;\
    </style>\
    <body> <h1 class="title"> OpenWRT Router </h1>\
      <script>\
        function getNewSSID() {\
        return document.getElementById(\'newssid\').value;}\
        function getNewPass() {\
          return document.getElementById(\'newpass\').value;}\
        function myFunction (){\
          if (getNewSSID() != \'\'){\
            document.getElementById(\'ssid\').innerHTML = getNewSSID();\
            window.ReactNativeWebView.postMessage(\"uci set wireless.@wifi-iface[0].ssid=\'\"+ getNewSSID() +\"\' \\nuci commit wireless\");}\
          }\
          function myFunction2 (){\
            window.ReactNativeWebView.postMessage(\"uci set wireless.@wifi-iface[0].key=\'\"+ getNewPass() +\"\' \\nuci commit wireless\");}\
      </script>\
      <h1 class="headers">SSID: </h1>\
      <h2 id=\'ssid\' class="sname">$uci get wireless.@wifi-iface[0].ssid$</h2>\
      <div>\
      <h2>Change SSID:</h2> <label id=\'id1\' for=\'newssid\'>Enter new SSID: </label>\
      <input id=\'newssid\' type=\'text\'> <br/>\n<form><input type=\'button\' value=\'Apply\' onclick=\'myFunction()\'></form>\
      <label id=\'id2\' form=\'newpass\'>Enter new password: </label>\
      <input id=\'newpass\' type=\'text\'> <br/>\n<form><input type=\'button\' value=\'Apply\' onclick=\'myFunction2()\'></form>\
      </div>\
      <br/><br/><br/><h1 class="headers">Connected devices: </h1><table>$cd ..\n/etc/config/show_wifi_clients.sh$</table>\
      <br/><br/><br/><h1 class="headers">Routing table: </h1><p>$ip r$</p>\
      <br/><br/><br/><h1 class="headers">Network Traffic</h1><p>$vnstat -i br-lan$</p>\
    </body>\
  </html>'




  export var routerCommand ="Name: OpenWRT Router\
    Connectivity: SSH user:root host:192.168.1.1 password:admin num_of_devices_paired:0 devices_paired_id:None dp_pass:None<html>\
      <body> <h1 class='title'> OpenWRT Router </h1>\
          <script>\
              function getNewSSID() {\
              return document.getElementById('newssid').value;}\
              function getNewPass() {\
              return document.getElementById('newpass').value;}\
              function myFunction (){\
              if (getNewSSID() != ''){\
                  document.getElementById('ssid').innerHTML = getNewSSID();\
                  window.ReactNativeWebView.postMessage(\"uci set wireless.@wifi-iface[0].ssid=\'\"+ getNewSSID() +\"\' \\nuci commit wireless\");}\
              }\
              function myFunction2 (){\
                  window.ReactNativeWebView.postMessage(\"uci set wireless.@wifi-iface[0].ssid=\'\"+ getNewSSID() +\"\' \\nuci commit wireless\");}\
          </script>\
          <div class='change-ssid'>\
              <div class='ssid'>\
                  <h1 class='ssid-title'>Router's SSID: </h1>\
                  <span id='ssid' class='actual-ssid'>$uci get wireless.@wifi-iface[0].ssid$</span>\
              </div>\
              <div class='change-input'>\
                  <h2>Change SSID:</h2>\
                  <form>\
                      <label id='id1' for='newssid'>SSID: </label>\
                      <input id='newssid' type='text' placeholder='Enter new SSID here'>\
                      <input type='button' value='Apply' onclick='myFunction()'>\
                  </form>\
                  <form>\
                      <label id='id2' form='newpass'>Password: </label>\
                      <input id='newpass' type='password' placeholder='Enter new password here'>\
                      <input type='button' value='Apply' onclick='myFunction2()'>\
                  </form>\
              </div>\
          </div>\
          <div class='connected-devices'>\
              <h1 class=c'onnected-devices-title'>Connected devices: </h1>\
          		<div class='connected-devices-table'>\
                  <table>$cd ..\n/etc/config/show_wifi_clients.sh$</table>\
              </div>\
          </div>\
          <div class=r'outing-table'>\
              <h1 class='headers'>Routing table: </h1>\
              <p>$ip r$</p>\
          </div>\
          <div class='network-traffic'>\
              <h1 class='headers'>Network Traffic</h1>\
              <p>$vnstat -i br-lan$</p>\
          </div>\
      </body>\
      <style>\
          body {\
              font-family: Helvetica;\
              color: white;\
              background-color:black;\
          }
          h1.title {\
              border-radius: 25px;\
              text-align: center;\
              font-size:5em;\
              background-color: #191919;\
              padding-top: 50px;\
              padding-bottom: 50px;\
              color:white;\
          }\
          h1.headers {\
              display:inline;\
              font-size:2.5em;\
          }\
        	.change-ssid {\
              background-color: #242424;\
              border-radius: 25px;\
              padding: 20px;\
        	}\
          div.ssid {\
              font-size: 20px;\
              text-align: center;\
              background-color: #191919;\
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
        	}\
        	h2 {\
        		font-size: 30px;\
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
        	input[type=button]:active {\
              background-color: rgb(30, 84, 109);\
          }\
          .connected-devices {\
              background-color: #242424;\
              border-radius: 25px;\
              margin-top: 20px;\
            	padding-bottom: 25px;\
          }\
        	h1.connected-devices-title {\
            	padding-top: 20px;\
            	padding-left: 30px;\
        	}\
        	.connected-devices-table {\
        			padding-left: 30px;\
        	}\
          .routing-table {\
          		background-color: #242424;\
              border-radius: 25px;\
              margin-top: 20px;\
            	padding-top: 20px;\
            	padding-bottom: 10px;\
          }\
          .network-traffic {\
              background-color: #242424;\
              border-radius: 25px;\
              margin-top: 20px;\
            	padding-top: 20px;\
           		padding-bottom: 10px;\
          }\
        	table {\
            text-align: left;\
            border: 2px solid gray;\
            border-collapse: collapse;\
        	}\
          th {\
  					background-color:gray;\
            color:white;\
            padding: 15px;\
            border-color: gray;\
          }\
        	td {\
        		color: white;\
            padding: 15px;\
          }\
      </style></html>"
