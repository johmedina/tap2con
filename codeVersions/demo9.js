/* 2 commands overlapping */

import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    SafeAreaView,
    StyleSheet,
    TextInput,
    Alert
} from 'react-native';
import NfcManager, {Ndef, NfcTech, NfcEvents} from 'react-native-nfc-manager';
import HTML from 'react-native-render-html';
import SSH from 'react-native-ssh';

config = {user: 'root',host: '192.168.1.1',password: 'admin'}
command = 'ls'

function buildTextPayload(valueToWrite) {
    return Ndef.encodeMessage([
        Ndef.textRecord(valueToWrite),
    ]);
}


class App extends React.Component {
  constructor(props){
      super(props);
      this.state = {
          text:'<h1>Connected devices: </h1><p>$cd ..\ncat tmp/dhcp.leases$</p>\n a lot more words here i wanna see if it works and more and something a long assssssssssss\n MORE WORDS WORF CLNKV LJKDFFKCV FKJ DSNK VOFINVCOJEN KFP NFKDLSNL OK FINE',
          code: "password",
          match: "Denied",
          allow: 0,
          retvalue: '',
          parsed: '',
          tag: {},

      }
  }

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

    writeData = async () => {
      try {
        let resp = await NfcManager.requestTechnology(NfcTech.Ndef, {
          alertMessage: 'Ready to write some NFC tags!'
        });

        let ndef = await NfcManager.getNdefMessage();
        let bytes = buildTextPayload(this.state.text);
        await NfcManager.writeNdefMessage(bytes);
        await NfcManager.setAlertMessageIOS('I got your tag!');

        this._cleanUp();
      } catch (ex) {
        console.warn('ex', ex);
        this._cleanUp();
      }
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

    this.setState({
      allow: 1,
      match: 'Accepted',
    })
    NfcManager.setAlertMessageIOS('I got your tag!');
    NfcManager.unregisterTagEvent().catch(() => 0);
  }

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

    else {
      var text = this.state.parsed[0]
      var updated = text
      var i = text.indexOf('$')
      while (i != -1)
      {
        var j = updated.indexOf('$',i+1)
        var command = updated.substring(i+1,j)

        SSH.execute(config,command).then(
            result => this.setState({retvalue : result}))
        updated = updated.replace(updated.substring(i,j+1),this.state.retvalue)

        var k = updated.indexOf(',')

        while (k != -1)
        {
          updated = updated.replace(updated.substring(k,k+1),'<br>')
          k = updated.indexOf(',',k+1)
        }

        i = updated.indexOf('$')
      }


      return (
        <View style = {styles.thing}>
          <View><HTML html = {updated}/></View>
          <TouchableOpacity style={styles.buttonWrite} onPress={() => this.setState({allow: 0})}>
            <Text> Go back </Text>
          </TouchableOpacity>
        </View>
      )
    }
  }
}

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
  }
})

export default App;
