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

function buildUrlPayload(valueToWrite) {
    return Ndef.encodeMessage([
        Ndef.textRecord(valueToWrite),
    ]);
}

class App extends React.Component {
  constructor(props){
      super(props);
      this.state = {
          log: "Ready...",
          text: '<h1>Connected devices: </h1><p>$cd ..\ncat tmp/dhcp.leases$</p>',
          code: "password",
          match: "Denied",
          allow: 0,
          retvalue: '',

      }
  }

  componentDidMount() {
    NfcManager.start();
    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      console.warn('tag', tag);
      NfcManager.setAlertMessageIOS('I got your tag!');
      NfcManager.unregisterTagEvent().catch(() => 0);
    });
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
        console.warn(ndef);
        let bytes = buildUrlPayload(this.state.text);
        await NfcManager.writeNdefMessage(bytes);
        console.warn('successfully write ndef');
        await NfcManager.setAlertMessageIOS('I got your tag!');

        this._cleanUp();
      } catch (ex) {
        console.warn('ex', ex);
        this._cleanUp();
      }
    }

    readData = async () => {
      try {
        await NfcManager.registerTagEvent();
        let whatIread = NfcManager.getNdefMessage();
        console.warn(whatIread);
        this.setState({
          log: this.state.text,
          allow: 1,
          match: 'Accepted',
        })
      } catch (ex) {
        console.warn('ex', ex);
        NfcManager.unregisterTagEvent().catch(() => 0);
      }
    }

  render() {
    if (this.state.allow == 0){
      return (
          <View style={styles.container}>
              <Text style={styles.textTitle}> SMD Senior Design Project </Text>

              <TouchableOpacity
                  style={styles.buttonWrite}
                  onPress={this.writeData}>
                  <Text style={styles.buttonText}>Write</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={styles.buttonRead}
                  onPress={this.readData}>
                  <Text style={styles.buttonText}>Read</Text>
              </TouchableOpacity>

              <View style={styles.log}>
                  <Text>{this.state.log}</Text>
              </View>

              <View style={styles.log}>
                  <Text> Permission to connect to router: </Text>
                  <Text>{this.state.match}</Text>
              </View>
          </View>
      )
    }

    else {
      var text = this.state.log
      var i = text.indexOf('$')
      var j = text.indexOf('$',i+1)
      var command = text.substring(i+1,j)


      SSH.execute(config,command).then(
          result => this.setState({retvalue : result}))
      var updated = text.replace(text.substring(i,j+1),this.state.retvalue)

      var k = updated.indexOf(',')

      while (k != -1)
      {
        updated = updated.replace(updated.substring(k,k+1),'<br>')
        k = updated.indexOf(',',k+1)
      }

      return (
        <View style = {styles.thing}>
          <HTML html = {updated}/>
          <TouchableOpacity style={styles.buttonWrite} onPress={() => this.setState({allow: 0})}>
            <Text> Go back </Text>
          </TouchableOpacity>
        </View>)
    }
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },

    textTitle: {
        color: 'black',
        textAlign: 'center',
        marginBottom: 20
    },

    textInput: {
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 10,
        height: 50,
        textAlign: 'center',
        color: 'black'
    },
    buttonWrite: {
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 10,
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
        backgroundColor: 'black'
    },
    buttonText: {
        color: '#ffffff'
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
