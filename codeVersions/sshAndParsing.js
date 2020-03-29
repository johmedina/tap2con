import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  Linking,
  AsyncStorage
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import SSHClient from 'react-native-ssh-sftp';
import WebView from 'react-native-webview';


var code= '<html>\
              <body>\
                <script>\
                  function getNewSSID() {\
                  return document.getElementById(\'newssid\').value;}\
                  function myFunction (){\
                    document.getElementById(\'ssid\').innerHTML = getNewSSID();\
                    window.ReactNativeWebView.postMessage(\"uci set wireless.@wifi-iface[0].ssid=\'\"+ getNewSSID() +\"\' \\nuci commit wireless\");}\
                </script>\
                <h1 style=\"display:inline;\">SSID: </h1>\
                <h2 id=\'ssid\' style=\"display:inline;\">$uci get wireless.@wifi-iface[0].ssid$</h2>\
                <h2>Change SSID:</h2> <label id=\'id1\' for=\'newssid\'>Enter new SSID: </label>\
                <input id=\'newssid\' type=\'text\'> <br/>\n<form><input type=\'button\' value=\'Apply\' onclick=\'myFunction()\'></form>\
                <h1>Connected devices: </h1><p>$cd ..\n/etc/config/show_wifi_clients.sh$</p>\
                <h1>Routing table: </h1><p>$ip r$</p>\
                <h1>Network Traffic</h1><p>$vnstat -i br-lan$</p>\
              </body>\
            </html>'
let client = new SSHClient('192.168.1.1', 22, 'root', 'admin', (error) => {
  if (error)
    console.log(error)
});

let WebViewRef
var out = ''
var z = 0
var i = 0
var j = 0
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      outputarr: [],
      updated: '',
      count: -1,
      pressed: 0
    }

  }

  componentDidMount() {
    let client = new SSHClient('192.168.1.1', 22, 'root', 'admin', (error) => {
      if (error)
        out = error;
    });

  }
  componentWillUnmount() {
    WebViewRef.reload()

  }


  render() {

    if (this.state.pressed == 1) {
      var out_array = []
      var command_array = []
      var updated = code
      i = code.indexOf('$')
      while (i != -1){
        j = code.indexOf('$',i+1)
        var command = code.substring(i+1,j)

        command_array.push(command)

        client.execute(command, (error, output) => {
          if (error)
            console.log("Please connect to you router");
          if (output)
            out_array.push(output)
            console.log(command_array)
            if (out_array.length == command_array.length){
              this.update_html(out_array,updated)
            }
        });

        i = code.indexOf('$',j+1)

      }

      return (
        <WebView key = {this.state.count} ref={WEBVIEW_REF => (WebViewRef = WEBVIEW_REF)} originWhitelist={['*']} source = {{html: this.state.updated}} onMessage={event => {
          this.changessid(event.nativeEvent.data);
        }}/>
      );
    }
    else{
      return (
        <View style = {{textAlign: 'center',marginTop: 300}}>
          <Button onPress = {() => this.buttonpress()} title = 'Click to view info'/>
        </View>
      )
    }

  }
  update_html(out_array, updated) {
    var z = 0
    for (z = 0; z < out_array.length; z ++){
      i = updated.indexOf('$')
      j = updated.indexOf('$',i+1)
      updated = updated.replace(updated.substring(i,j+1),out_array[z])
    }
    console.log(updated)

    this.setState({
      updated: updated
    })

  }

  changessid(cmd){
    console.log(cmd)
    client.execute(cmd, (error, output) => {
      if (error)
        console.warn(error);
      if (output)
        out = output;
        console.log(out)
    });
  }

  buttonpress() {
    this.setState({
      pressed: 1
    });

  }
}


const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});
