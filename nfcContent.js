export var routerCommand =
  'Name: OpenWRT Router\
  Connectivity: SSH user:root host:192.168.1.1 password:admin num_of_devices_paired:1 devices_paired_id:johanne dp_pass:medina<html>\
    <style> body {font-family: Helvetica;color: white;background-color:black; margin-top:150px; margin-left:35px;}\
    h1.title{text-align: center; font-size:5em;} h1.headers{display:inline; font-size:3em;}\
    h2.sname{display: inline; font-size:3em;}\
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
      <br/><br/><br/><h1 class="headers">Connected devices: </h1><p>$cd ..\n/etc/config/show_wifi_clients.sh$</p>\
      <br/><br/><br/><h1 class="headers">Routing table: </h1><p>$ip r$</p>\
      <br/><br/><br/><h1 class="headers">Network Traffic</h1><p>$vnstat -i br-lan$</p>\
    </body>\
  </html>'
