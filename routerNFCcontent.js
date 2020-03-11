/*<body>
<div>
  <script>
  	function getNewSSID() {
      return document.getElementById('newssid').value;}
    function myFunction (){
      var ns1 = 'uci set wireless.@wifi-iface[0].ssid=\''
      var ns2 = getNewSSID()
      var ns3 = '\'\n uci commit wireless'
      var ns = ns1.concat(ns2, ns3);
      document.getElementById('ssid').innerHTML = getNewSSID();
      window.postMessage("Sending data from WebView");}


  </script>
  <h1 style="display:inline;">SSID: </h1>
  <h2 id='ssid' style="display:inline;">$uci get wireless.@wifi-iface[0].ssid$</h2>
  <h2>Change SSID:</h2> <label id='id1' for='newssid'>Enter new SSID: </label>
  <input id='newssid' type='text'> <br/>
  <form><input type='button' value='Apply' onclick='myFunction()'></form>


  <h1>Connected devices: </h1><p>$cd ..\ncat tmp/dhcp.leases$</p>
  <h1>Routing table: </h1><p>$ip r$</p>
</div>
</body> */

const rcs = "<html><head><style>h1.title{text-align:center; font-size:5em;} h1.headers{display:inline; font-size:3em;} h2.sname{display:inline; font-size:3em;}"
const rcs1 = "</style></head>"
const rc1 = "<body><div style='margin-left:40px'><h1 class='title'>OpenWRT Router</h1> <script>function getNewSSID(){return document.getElementById('newssid').value;}\n"
const rc2 = "function myFunction(){ var ns1 = 'uci set wireless.@wifi-iface[0].ssid=' \n"
const rc3 = "var ns2 = getNewSSID() \n var ns3 = ' uci commit wireless'\n var ns = ns1+ns2+ns3; \n"
const rc4 = "document.getElementById('ssid').innerHTML = getNewSSID();"
const rc5 = "}</script>"
const rc6 = "<h1 class='headers'>SSID: </h1>"
const rc7 = "<h2 id='ssid' class='sname'> $uci get wireless.@wifi-iface[0].ssid$ </h2>"
const rc8 = "<div><h3>Change SSID:</h3> <label id='id1' for='newssid'>Enter new SSID: </label>"
const rc9 = "<input id='newssid' type='text'> <br/> <form><input type='button' value='Apply' onclick='myFunction()'></form></div>"
const rc10 = "<br/><br/><h1 class='headers'>Connected devices: </h1><p>$cd ..\ncat tmp/dhcp.leases$</p><br/><br/><h1 class='headers'>Routing table: </h1><p>$ip r$</p>"
const rc11 = "</div> </body> </html>"
export const routerCommand = rcs + rcs1 + rc1 + rc2 + rc3 + rc4 + rc5 + rc6 + rc7 + rc8 + rc9 + rc10 + rc11
