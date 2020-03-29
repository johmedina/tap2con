/* Read and write to 32k with old SSH */

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

import NfcManager, {Ndef, NfcTech, NfcEvents} from 'react-native-nfc-manager';
import HTML from 'react-native-render-html';
import SSH from 'react-native-ssh';
import { WebView } from 'react-native-webview';

// configuration and credentials for ssh access and command
//config = {user: 'root',host: '192.168.1.1',password: 'admin'}
//command = 'ls'

function buildTextPayload(valueToWrite) {
    return Ndef.encodeMessage([
        Ndef.textRecord(valueToWrite),
    ]);
}

class App extends React.Component {
  constructor(props){
      super(props);
      this.state = {
          match: "Denied",
          allow: 0,
          retvalue1: '',
          retvalue2: '',
          retvalue3: '',
          parsed: '',
          tag: {},
          header: '',
          htmlCode: '',

      }
  }

  /* ---------- NFC Component -------- */

  componentDidMount() {
    NfcManager.start();
    NfcManager.setEventListener(NfcEvents.DiscoverTag, this._onTagDiscovered);
  }

  componentWillUnmount() {
    this._cleanUp();
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    NfcManager.unregisterTagEvent().catch(() => 0);
  }


    _cleanUp = () => {
      NfcManager.cancelTechnologyRequest().catch(() => 0);
    }


    readData = async () => {
      try {
        await NfcManager.registerTagEvent()

      } catch (ex) {
        console.warn('ex', ex);
        NfcManager.unregisterTagEvent().catch(() => 0);
      }
    }

    _onTagDiscovered = tag => {
    this.setState({ tag });

    let parsed = null;
    if (tag.ndefMessage && tag.ndefMessage.length > 0) {
        // ndefMessage is actually an array of NdefRecords,
        // and we can iterate through each NdefRecord, decode its payload
        // according to its TNF & type
        const ndefRecords = tag.ndefMessage;

        function decodeNdefRecord(record) {
            if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
                return Ndef.text.decodePayload(record.payload);
            }

            return ['unknown', '---']
        }

        parsed = ndefRecords.map(decodeNdefRecord);
    }

    this.setState({parsed});

    NfcManager.setAlertMessageIOS('I got your tag!');
    NfcManager.unregisterTagEvent().catch(() => 0);

    // Extract the header and the actual html code from the nfc content
    var content = this.state.parsed[0];
    var h = content.indexOf('<html>');

    this.setState({
      header: content.substring(0,h),
      htmlCode: content.substring(h),
    })

    // Process the security part of the NFC
    this.addSecurity()

  }

  // Function that handles the security cross-checking upon reading the NFC tag
  addSecurity = () => {
    // Parse header that contains NFC security protocols
    var hdr = this.state.header
    var k = hdr.indexOf('key');
    var n = hdr.indexOf('num_of_devices_paired');
    var dp = hdr.indexOf('devices_paired_id');
    var a = hdr.indexOf('admin_phone_paired');

    var content = this.state.parsed[0];
    var h = content.indexOf('<html>');

    // NFC password
    var nfcPass = hdr.substring(k+4, n);
    // Number of paired devices
    var numOfDevP = hdr.substring(n+22, dp);
    // Array of devices devices_paired_id
    var devId = hdr.substring(dp+18, a)
    // Is the admin already initialized?
    var adminPhone = hdr.substring(a+19, h)

    console.warn(nfcPass, numOfDevP, devId, adminPhone)
    //set up admin phone
    if (adminPhone === 'false') {
      //generate new random key
      nfcPass = Math.floor(1000 + Math.random() * 9999)
      console.warn(nfcPass)

      numOfDevP = parseInt(numOfDevP)
      numOfDevP = numOfDevP + 1

      var arrOfDev = devId.split(",")
      arrOfDev.push('johanne')
      console.warn(arrOfDev)
      adminPhone = 'true'

      //write these back to the nfc tag
    }

    this.setState({
      allow: 1,
      match: 'Accepted',
    })
  }



  /* --------- End of NFC Component ---------- */

  /* --------- Main render screen ----------- */

  render() {
    if (this.state.allow == 0){
      return (
        <View style={styles.container}>
            <Text style={styles.textTitle}>tap2con</Text>
            <Text style={styles.info}>
              Tap Mifare Ultralight NFC to connect, control, and configure</Text>

            <TouchableOpacity
                style={styles.buttonRead}
                onPress={this.readData}>
                <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>


            <View style={styles.log}>
                <Text> Permission to connect to router: </Text>
                <Text>{this.state.match}</Text>
            </View>
        </View>
      )
    }

    /* --------- SSH Component ---------- */
    else {
      var hd = window.header
      var u = hd.indexOf('user:')
      var hs = hd.indexOf('host:')
      var p = hd.indexOf('password:')
      var k = hd.indexOf('key:')
      var usr = hd.substring(u+5, hs)
      var hst = hd.substring(hs+5, p)
      var pass = hd.substring(p+9, k)
      var config = "{user: '" + usr + "', host: '" + hst + "', password: '" + pass + "'}";
      console.warn(config)

      var text = this.state.parsed
      var updated = text
      var i = text.indexOf('$')
      var j = updated.indexOf('$',i+1)
      var command = updated.substring(i+1,j)

      SSH.execute(config,command).then(
          result => this.setState({retvalue1 : result}))
      var updated = updated.replace(updated.substring(i,j+1),this.state.retvalue1)

      i = updated.indexOf('$')
      j = updated.indexOf('$',i+1)
      command = updated.substring(i+1,j)

      SSH.execute(config,command).then(
          result => this.setState({retvalue2 : result}))
      updated = updated.replace(updated.substring(i,j+1),this.state.retvalue2)

      var k = updated.indexOf(',')

      while (k != -1)
      {
        updated = updated.replace(updated.substring(k,k+1),'<br>')
        k = updated.indexOf(',',k+1)
      }

      i = updated.indexOf('$')
      j = updated.indexOf('$',i+1)
      command = updated.substring(i+1,j)

      SSH.execute(config,command).then(
          result => this.setState({retvalue3 : result}))
      updated = updated.replace(updated.substring(i,j+1),this.state.retvalue3)

      var k = updated.indexOf(',')

      while (k != -1)
      {
        updated = updated.replace(updated.substring(k,k+1),'<br>')
        k = updated.indexOf(',',k+1)
      }

      /* ------------ End of SSH component ------------*/

      // Render HTML page from NFC tag
      return (
          <WebView style = {styles.thing} source={{html: updated}} />
      )
    }
  }

  /* ---------- End of Main render ----------- */

}

/* ------------- STYLES ------------- */

const styles = StyleSheet.create({
  container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      padding: 10,
      backgroundColor: 'black'
  },

  textTitle: {
      color: 'white',
      textAlign: 'center',
      marginBottom: 20,
      fontWeight: 'bold',
      fontSize: 50,
  },

  info: {
      textAlign: 'center',
      color: 'white',
      marginBottom: 30,
  },
  buttonWrite: {
      margin: 20,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: 'gray'
  },

  buttonRead: {
      marginLeft: 20,
      marginRight: 20,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: 'white',
  },
  buttonText: {
      color: 'black',
      fontSize: 30
  },
  log: {
      marginTop: 30,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
  },

  thing: {
    justifyContent: 'center',
    flex: 1,
    marginTop: 300,
  }
})

export default App;
