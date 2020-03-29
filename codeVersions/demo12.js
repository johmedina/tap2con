//WORKING FILE THE BEST SO FAR


/* Reading and writint to 32K NFC tag
 */

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
import { WebView } from 'react-native-webview';
import {routerCommand} from './nfcContent';
import SSH from 'react-native-ssh';

function buildTextPayload(valueToWrite) {
    return Ndef.encodeMessage([
        Ndef.textRecord(valueToWrite),
    ]);
}


class HomePage extends React.Component {
  constructor(props){
      super(props);
      this.state = {
          continue: 0,
          text: routerCommand,
          match: "Denied",
          allow: 0,
          parsed: '',
          tag: {},
          header: '',
          htmlCode: '',
          username: '',
          password: '',
          updated: '',

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
        console.log('writing log ', this.state.text)
        await NfcManager.writeNdefMessage(bytes);
        await NfcManager.setAlertMessageIOS('I got your tag!');

        this.setState({allow:1})

        this._cleanUp();
      } catch (ex) {
        console.warn('ex writing', ex);
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

    NfcManager.setAlertMessageIOS('I got your tag!');
    NfcManager.unregisterTagEvent().catch(() => 0);


    // Extract the header and the actual html code from the nfc content
    var content = this.state.parsed[0];
    var h = content.indexOf('<html>');
    console.log('username: ', this.state.username, 'password:', this.state.password)

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

    console.log(nfcPass, numOfDevP, devId, adminPhone)
    //set up admin phone initially
    if (adminPhone === 'false') {
      //generate new random key
      var newNfcPass = Math.floor(1000 + Math.random() * 9999)
      newNfcPass = newNfcPass.toString() + " "

      var newNumOfDevP = parseInt(numOfDevP)
      newNumOfDevP = newNumOfDevP + 1
      newNumOfDevP = newNumOfDevP.toString() + " "

      var newDevId = this.state.username
      newDevId = newDevId.concat(' ')
      var newAdminPhone = 'true'

      //write these back to the nfc tag
      var newHeader = hdr.replace(nfcPass, newNfcPass)
      newHeader = newHeader.replace(numOfDevP, newNumOfDevP)
      newHeader = newHeader.replace(devId, newDevId)


      newHeader = newHeader.replace(adminPhone, newAdminPhone)
      //console.log('newHeader: ', newHeader)

      var newContent = newHeader.concat(this.state.htmlCode)
      //console.log('newContent: ', newContent)
    }

    //if not admin phone
    else {
      var uname = this.state.username
      var pss = this.state.password

      //if not a regsitered user, dont allow
      if (nd == 1){this.setState({allow: 0})}

      //check if this user is paired and authorized
      var nd = parseInt(numOfDevP)
    }

    this.setState({
      continue: 1,
      match: 'Accepted',
      text: newContent,
    })

  }

  listToString = (list1) => {
    if (list1.length > 0) {
      var str1 = list1[0]
        for (let i = 1; i < list1.length; i++){
          str1 += '<br/>'
          str1 += list1[i]
        }
      return (str1)
    }
    return ('Not Available')
  };

  update_html(out_array, updated) {
    var z = 0
    var outs = ''
    var finalOuts = ''
    for (z = 0; z < out_array.length; z ++){
      console.log('output:',out_array[z])
      outs = this.listToString(out_array[z])
      console.log('outs:',outs)
      i = updated.indexOf('$')
      j = updated.indexOf('$',i+1)
      updated = updated.replace(updated.substring(i,j+1),outs)
    }
    console.log(updated)

    this.setState({
      updated: updated
    })

  }

  changeSandP(config, cmd){
    console.log(cmd)
    SSH.execute(config,cmd).then(
      result => {
        console.log(result)
      }
    )

  }


  render() {
    if (this.state.continue == 0){
      return(
        <View style={styles.container}>
          <Text style={styles.textTitle}>tap2con</Text>

          <View style = {{flexDirection: 'row', alignSelf: 'center'}}>
            <Text style={styles.up}> Username: </Text>
            <TextInput
              placeholder = 'Enter username'
              placeholderTextColor = "gray"
              autoCapitalize = "none"
              autoCorrect = {false}
              style= {[styles.inputBoxes, {fontStyle:'italic'}]}
              onChange={(event) => this.setState({username: event.nativeEvent.text})}

            />
          </View>

          <View style = {{flexDirection: 'row', alignSelf: 'center'}}>
            <Text style={styles.up}> Password: </Text>
            <TextInput
              placeholder = 'Enter password'
              placeholderTextColor = "gray"
              autoCorrect = {false}
              secureTextEntry={true}
              autoCapitalize = "none"
              style= {[styles.inputBoxes, {fontStyle:'italic'}]}
              onChange={(event) => this.setState({password: event.nativeEvent.text})}

            />
          </View>

          <Text style={styles.info}> Log in and scan NFC tag to continue </Text>

          <TouchableOpacity
            style = {styles.signButton}
            onPress = {this.readData}
          >
              <Text style = {{alignSelf: 'center'}}> CONTINUE</Text>
          </TouchableOpacity>

        </View>
      )
    }

    else {
      if (this.state.allow == 0) {
        return (
          <View style={styles.container}>
              <Text style={styles.textTitle}>tap2con</Text>
              <Text style={styles.info2}>
                Tap Mifare Ultralight NFC to connect, control, and configure</Text>

              <TouchableOpacity
                  style={styles.buttonScan}
                  onPress={this.writeData}>
                  <Text style={styles.buttonText}>SCAN</Text>
              </TouchableOpacity>


              <View style={styles.log}>
                  <Text> Permission to connect to router: </Text>
                  <Text>{this.state.match}</Text>
              </View>

              <TouchableOpacity>
                <Text> Add Users </Text>
              </TouchableOpacity>
          </View>
        )
      }

      else {
        var out = ''
        var z = 0
        var i = 0
        var j = 0
        //get the user, host, and password variables from the header
        var hd = this.state.header
        var u = hd.indexOf('user:')
        var hs = hd.indexOf('host:')
        var p = hd.indexOf('password:')
        var k = hd.indexOf('key')
        var usr = hd.substring(u+5, hs-1)
        var hst = hd.substring(hs+5, p-1)
        var pass = hd.substring(p+9, k-1)
        console.log(usr, hst, pass)
        var config ={user: usr ,host: hst, password: pass}
        console.log(config)

        var out_array = []
        var command_array = []
        var code = this.state.htmlCode
        console.log('code: ', code)
        var updated = code
        i = code.indexOf('$')
        while (i != -1){
          j = code.indexOf('$',i+1)
          var command = code.substring(i+1,j)

          command_array.push(command)
          console.log('command: ', command)


          SSH.execute(config,command).then(
            result => {
              out_array.push(result)
              console.log(out_array)
              if (out_array.length == command_array.length){
                this.update_html(out_array,updated)
            }}
          )

          i = code.indexOf('$',j+1)

        }

        return (
            <WebView
              style = {styles.thing}
              source={{html: this.state.updated}}
              onMessage={event => {
                this.changeSandP(config, event.nativeEvent.data);
              }}
            />
        )
      }

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
    marginTop: -50,
    marginBottom: 50,
    fontSize: 30,
    fontWeight: 'bold'
  },


  info: {
    textAlign: 'center',
    color: 'white',
    marginTop: 30,
  },

  info2: {
    textAlign: 'center',
    color: 'white',
    marginBottom: 30,
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
        marginBottom: 20,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: 'gray'
    },
    buttonScan: {
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: 'white'
    },
    buttonText: {
        color: 'black'
    },

    inputBoxes: {
      alignSelf: 'center',
      width: '50%',
      borderBottomWidth: 1,
      borderBottomColor: 'white',
      fontSize: 16,
      marginBottom: 15,
      color:'white',
    },

    up: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'white'

    },

    log: {
        marginTop: 30,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        color: 'white'
    },

    thing: {
      justifyContent: 'center',
      flex: 1,
    },

    addUsersButton: {
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: 'gray',
    },
    signButton: {
      backgroundColor: 'white',
      borderWidth: 2,
      width: 140,
      height: 25,
      justifyContent: 'center',
      marginTop: 30,
      marginLeft: 136,
    },
})

export default HomePage;
