
/* Reading and Writing to 32K NFC tags
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
    Alert,
    NativeModules
} from 'react-native';
import NfcManager, {Ndef, NfcTech, NfcEvents} from 'react-native-nfc-manager';
import HTML from 'react-native-render-html';
import { WebView } from 'react-native-webview';
import {routerCommand} from './nfcWFI';

function buildTextPayload(valueToWrite) {
    return Ndef.encodeMessage([
        Ndef.textRecord(valueToWrite),
    ]);
}

var Aes = NativeModules.Aes;

class App extends React.Component {
  constructor(props){
      super(props);
      this.state = {
          text: routerCommand,
          code: "password",
          match: "Denied",
          allow: 0,
          retvalue: '',
          parsed: '',
          tag: {},
          header: '',
          htmlCode: '',
          username: '',
          password: '',
          decryptedText: '',

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

    generateKey = (password, salt, cost, length) => Aes.pbkdf2(password, salt, cost, length)

    encrypt = (text, key) => {
        return Aes.randomKey(16).then(iv => {
            return Aes.encrypt(text, key, iv).then(cipher => ({
                cipher,
                iv,
            }))
        })
    }

    decrypt = (encryptedData, key) => Aes.decrypt(encryptedData.cipher, key, encryptedData.iv)

    encryptFunction() {
      try {
        this.generateKey('dcnfjlkbd298SKDH', 'DCJKN278hdsb', 5000, 256).then(key => {
            console.log('Key:', key)
            this.encrypt(routerCommand, key)
                .then(({ cipher, iv }) => {
                    console.log('Encrypted:', cipher)
                    var myText = iv + ' ~ '+ cipher
                    this.setState({text: myText})

                    Aes.hmac256(cipher, key).then(hash => {
                        console.log('HMAC', hash)
                    })
                })
                .catch(error => {
                    console.log(error)
                })
        })
      } catch (e) {
          console.error(e)
      }
    }

    asyncDecrypt = async(cipher, key, iv) => {
      try {
          var text = await this.decrypt({ cipher, iv }, key)
          this.setState({decryptedText:text})
          console.log('decText:', this.state.decryptedText)

          var h = text.indexOf('<html>');

          this.setState({
            header: text.substring(0,h),
            htmlCode: text.substring(h),
          })

          console.log(this.state.header, this.state.htmlCode)
          // Process the security part of the NFC
          this.addSecurity()

          // Check which medium to use to connect to the device
          var hd = this.state.header
          var c = hd.indexOf('Connectivity:')
          //Connectivity choices: SSH, BLE, WFI
          var type = hd.substring(c+13, c+16)
          this.setState({ctype: type})
          console.log(this.state.ctype)

      }
      catch (e) {
          console.error(e)
      }
    }

    writeData = async () => {
      try {
        let resp = await NfcManager.requestTechnology(NfcTech.Ndef, {
          alertMessage: 'Ready to write some NFC tags!'
        });

        this.encryptFunction()
        let ndef = await NfcManager.getNdefMessage();
        let bytes = buildTextPayload(this.state.text);
        console.log('writing log ', this.state.text)
        await NfcManager.writeNdefMessage(bytes);
        await NfcManager.setAlertMessageIOS('I got your tag!');

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

    // Decrypt the NFC data
    var content = this.state.parsed[0];
    var endOfIV = content.indexOf(' ~ ')
    var iv = content.substring(0,endOfIV).trim()
    var cipher = content.substring(endOfIV+3)

    this.generateKey('dcnfjlkbd298SKDH', 'DCJKN278hdsb', 5000, 256).then(key => {
      this.asyncDecrypt(cipher, key, iv)

    })




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
    //set up admin phone
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

      a = newHeader.indexOf('admin_phone_paired')
      newHeader = newHeader.replace(adminPhone, newAdminPhone)
      //console.log(newHeader)

      var newContent = newHeader.concat(this.state.htmlCode)
      console.log(newContent)
    }

    //if not admin phone
    else {
      var uname = this.state.username
      //check the list of paired devices
      var nd = parseInt(numOfDevP)
      //if not a regsitered user, dont allow
      if (nd == 1){this.setState({allow: 0})}
      //add new user to the list of paired devices
      var newDevId = devId.concat(', ', uname, ' ')
    }

    this.setState({
      allow: 1,
      match: 'Accepted',
      text: newContent,
    })


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
                  <Text> Permission to connect to router: </Text>
                  <Text>{this.state.match}</Text>
              </View>
          </View>
      )
    }

    /* if SSH component */
    else {
      return (
          <WebView
            style = {styles.thing}
            source={{html: this.state.htmlCode}}
          />
      )
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
        marginBottom: 40,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: 'gray'
    },
    buttonRead: {
        marginLeft: 20,
        marginRight: 20,
        marginTop: 30,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: 'black'
    },
    buttonText: {
        color: '#ffffff'
    },

    inputBoxes: {
      alignSelf: 'center',
      width: '50%',
      borderBottomWidth: 1,
      borderBottomColor: 'black',
      fontSize: 16,
      marginBottom: 15,
      color:'black',
    },

    up: {
      fontSize: 16,
      fontWeight: 'bold',

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
