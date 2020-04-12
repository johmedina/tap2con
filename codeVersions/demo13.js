//WORKING FILE THE BEST SO FAR
/* Can read and write to 32K with SSH, security, hashing, and encryption */

/* The following describes the states used in the code and their functionality
 *
 *  State         ||    Description
 *  ----------------------------------------------------------------------------
 *  continue      ||    flag to move on to the next page if uninitialized or admin
 *  text          ||    string to write to the NFC tag
 *  allow         ||    flag if access to the device is allowed - proceed to WebView
 *  parsed        ||    store raw data from reading from the NFC tags
 *  tag           ||    store the tag ID from reading the NFC tags
 *  header        ||    store the header from the NFC tag read
 *  htmlCode      ||    store the html part of the string from the NFC tag read
 *  username      ||    store the input username
 *  password      ||    store the input password
 *  hashed        ||    store the input password's hashed value
 *  updated       ||    executed code from ssh - webview content to render
 *  modalVisible  ||    flag for displaying overlay when adding new users
 *  newUser       ||    store the username of the new username added
 *  newPass       ||    store the password of the new user password added
 *  adminName     ||    store the admin name from the NFC
 *  allowToAdd    ||    flag if curren user is allowed to add new users
 *  numOfDevP     ||    store the number of devices paired with
 *  devIds        ||    store all the devices paired from the NFC
 *  devIdPass     ||    store all the devices paired passwords from the NFC
 *  goToWebview   ||    flag for allowing access to Webview
 *  ctype         ||    connectivity type read from the NFC tag
 *  decryptedText ||    decrypted text
 *  userAdded     ||    flag to check if admin just added a user
 *  */


import React, { Component, Fragment } from 'react';
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
import { WebView } from 'react-native-webview';
import SSH from 'react-native-ssh';
import { JSHash, CONSTANTS } from "react-native-hash";
import Overlay from 'react-native-modal-overlay';

var Aes = NativeModules.Aes;

class App extends React.Component {
  constructor(props){
      super(props);
      this.state = {
          continue: 0,
          text: '',
          allow: 0,
          parsed: '',
          tag: {},
          header: '',
          htmlCode: '',
          username: '',
          password: '',
          hashed: '',
          updated: '',
          modalVisible: false,
          newUser: '',
          newPass: '',
          adminName: '',
          allowToAdd: 0,
          numOfDevP: 0,
          devIds: '',
          devIdPass: '',
          goToWebview: false,
          ctype: '',
          decryptedText: '',
          userAdded: 0,

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
            this.encrypt(this.state.text, key)
                .then(({ cipher, iv }) => {
                    console.log('IV from writing with encryption:', iv)
                    var myText = iv + ' ~ '+ cipher
                    this.setState({text: myText})

                })
                .catch(error => {
                    console.log(error)
                })
        })
      } catch (e) {
          console.error(e)
      }
    }


    writeData = async () => {
      /* Auxiliary function for encoding an Ndef message to
       * bytes used for writing to NFC tags */
      function buildTextPayload(valueToWrite) {
          return Ndef.encodeMessage([
              Ndef.textRecord(valueToWrite),
          ]);
      }

      try {
        let resp = await NfcManager.requestTechnology(NfcTech.Ndef, {
          alertMessage: 'Scan to Continue'
        });

        console.log('Header to write before encryption:', this.state.header)
        this.encryptFunction()
        let ndef = await NfcManager.getNdefMessage();
        let bytes = buildTextPayload(this.state.text);
        console.log('Writing log: ', this.state.text)
        await NfcManager.writeNdefMessage(bytes);
        await NfcManager.setAlertMessageIOS('Accessing Device...');

        if(this.state.goToWebview == true)
        {
          this.setState({allow:1})
        }

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

    asyncDecrypt = async(cipher, key, iv) => {
      try {
          var text = await this.decrypt({ cipher, iv }, key)
          this.setState({decryptedText:text})
          console.log('Decrypted text:', this.state.decryptedText)

          var h = text.indexOf('<html>');

          this.setState({
            header: text.substring(0,h),
            htmlCode: text.substring(h),
          })

          // Process the security part of the NFC
          this.addSecurity()

          // Check which medium to use to connect to the device
          var hd = this.state.header
          var c = hd.indexOf('Connectivity:')
          //Connectivity choices: SSH, BLE, WFI
          var type = hd.substring(c+13, c+16)
          this.setState({ctype: type})
          console.log('Connection type:',this.state.ctype)

      }
      catch (e) {
          console.error(e)
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

    NfcManager.setAlertMessageIOS('Login Successful');
    NfcManager.unregisterTagEvent().catch(() => 0);


    // Decrypt the NFC data
    var content = this.state.parsed[0];
    console.log('Content from read:', content)
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
    var n = hdr.indexOf('num_of_devices_paired');
    var dp = hdr.indexOf('devices_paired_id');
    var pss = hdr.indexOf('dp_pass')

    var content = this.state.decryptedText;
    var h = content.indexOf('<html>');

    // Number of paired devices
    var numOfDevP = hdr.substring(n+22, dp)
    // Array of devices devices_paired_id
    var devId = hdr.substring(dp+18, pss)
    // Array of devices paired password
    var devIdPass = hdr.substring(pss+8, h)

    this.setState({
      numOfDevP: numOfDevP,
      devIds: devId,
      devIdPass: devIdPass,
    })

    //get input username and Password
    var uname = this.state.username.trim()

    var idArray = devId.split(',')
    var passArray = devIdPass.split(',')
    console.log('Username array:', idArray, 'Password Array:', passArray)

    numOfDevP = idArray.length;
    var adminUser = idArray[0].trim()
    var adminPass = passArray[0].trim()

    //set up initial user
    if (adminUser === 'None') {

      var newNumOfDevP = '1';

      var newDevId = this.state.username
      newDevId = newDevId.concat(' ')


      var newDevIdPass = this.state.hashed
      newDevIdPass = newDevIdPass.concat(' ')

      //write these back to the nfc tag
      var newHeader = hdr.replace(numOfDevP, newNumOfDevP)
      newHeader = newHeader.replace(devId, newDevId)
      newHeader = newHeader.replace(devIdPass, newDevIdPass)

      var newContent = newHeader.concat(this.state.htmlCode)

      this.setState({
        continue: 1,
        text: newContent,
        header: newHeader
      })
    }

    //if user is the admin
    else if ((adminUser === uname) && (this.state.hashed === adminPass)){
      this.setState({
        continue: 1,
        text: content,
      })

    }

    else {
      var okUser = false;
      for(let i=0; i<numOfDevP; i++){
        if((uname === idArray[i].trim()) && (this.state.hashed === passArray[i].trim())){
          okUser = true;
        }
      }
      //if user is in the list of paired devices
      if(okUser == true){
        this.setState({
          continue: 1,
          allow:1,
          text: content,
        })
      }
      //not in the list of paired devices
      else {
        alert('Not a valid user.')
      }
    }

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



  addUser = () => {
    var nu = this.state.newUser
    var np = this.state.newPass

    // Parse header that contains NFC security protocols
    var hdr = this.state.header
    var n = hdr.indexOf('num_of_devices_paired');
    var dp = hdr.indexOf('devices_paired_id');
    var pss = hdr.indexOf('dp_pass')

    var content = this.state.decryptedText;
    var h = content.indexOf('<html>');

    // Number of paired devices
    var numOfDevP = hdr.substring(n+22, dp)
    // Array of devices devices_paired_id
    var devId = hdr.substring(dp+18, pss)
    // Array of devices paired password
    var devIdPass = hdr.substring(pss+8, h)

    var idArray = devId.split(',')
    var passArray = devIdPass.split(',')

    //allow access only to admin
    if ((this.state.username.trim() === idArray[0].trim()) && this.state.hashed === passArray[0].trim())
    {
      // Increment the number of paired devices
      var newNumOfDevP = idArray.length + 1
      newNumOfDevP = newNumOfDevP.toString(10) + " "
      // Add the new user
      var newDevId = devId.concat(',', nu, ' ')
      // Add the new password
      var newDevIdPass = devIdPass.concat(',',np, ' ')

      var newHeader = hdr.replace(numOfDevP, newNumOfDevP)
      newHeader = newHeader.replace(devId, newDevId)
      newHeader = newHeader.replace(devIdPass, newDevIdPass)

      var newContent = newHeader.concat(this.state.htmlCode)

      this.setState({text: newContent, allowToAdd:1, modalVisible:false, userAdded:1, header:newHeader,})
      this.writeData()
    }

    //Dont allow action if the user is not the admin
    else{
      this.setState({allowToAdd:0, modalVisible:false})
      alert('Not allowed to add user on initialization.')
    }

    }


  doPassword = (pw) => {
    var pss = pw.trim()
    this.setState({password: pss})
    //hash the password
    JSHash(pss, CONSTANTS.HashAlgorithms.keccak)
      .then(hash => this.setState({hashed: hash}))
      .catch(e => console.log(e));
  }

  doPasswordNew = (pw) => {
    var pss = pw.trim()
    //hash the password
    JSHash(pss, CONSTANTS.HashAlgorithms.keccak)
      .then(hash => this.setState({newPass: hash}))
      .catch(e => console.log(e));
  }

  update_html(out_array, updated) {
    var z = 0
    var outs = ''
    var cd = ''
    var temp = ''
    var cd1 = ''
    var temp1 = ''
    for (z = 0; z < out_array.length; z ++){
      outs = this.listToString(out_array[z])
      //create a table if the output is for connected devices
      if (outs[0] === '#')  {
        cd = outs.replace(/<br\/>/g,"\t")
        cd = cd.split(/\t/)
        cd = cd.filter(item => item);

        var cdlength = cd.length
        var rows = cdlength/3
        for(r=0; r<rows; r++) {
          temp = temp + '<tr>'
          // Table header for Connected Devices
          if (r==0){
            temp = temp + '<th>' + cd[0] + '</th>'
            temp = temp + '<th>' + cd[1] + '</th>'
            temp = temp + '<th>' + cd[2] + '</th>'
          }
          else{
            temp = temp + '<td>' + cd[0+(3*r)] + '</td>'
            temp = temp + '<td>' + cd[1+(3*r)] + '</td>'
            temp = temp + '<td>' + cd[2+(3*r)] + '</td>'
          }
          temp = temp + '</tr>'
        }
        outs = temp
      }

      else if (outs.search('default') != -1)  {
        //Table for Routing table
        cd1 = outs.replace(/<br\/>/g," ")
        cd1 = cd1.split(' ')
        cd1 = cd1.filter(item => item);

        var cdlength = cd1.length
        var rows = cdlength/7
        temp1 = temp1 + '<tr><th>Destination IP</th><th>Interface</th><th>Source IP</th></tr>'
        for(r=0; r<rows; r++) {
          temp1 = temp1 + '<tr>'
          if (r==0){
            temp1 = temp1 + '<td>' + '0.0.0.0' + '</td>'
            temp1 = temp1 + '<td>' + cd1[4] + '</td>'
            temp1 = temp1 + '<td>' + cd1[6] + '</td>'
          }
          else{
            temp1 = temp1 + '<td>' + cd1[0+(7*r)] + '</td>'
            temp1 = temp1 + '<td>' + cd1[2+(7*r)] + '</td>'
            temp1 = temp1 + '<td>' + cd1[6+(7*r)] + '</td>'
          }
          temp1 = temp1 + '</tr>'
        }
        outs = temp1
      }

      i = updated.indexOf('$')
      j = updated.indexOf('$',i+1)
      updated = updated.replace(updated.substring(i,j+1),outs)
    }

    this.setState({
      updated: updated
    })

  }

  changeSandP(config, cmd){
    SSH.execute(config,cmd).then(
      result => {
        console.log('Changed SSID/password', result)
      }
    )
  }

  scanToWebview = () => {
    this.setState({goToWebview: true})
    if(this.state.userAdded == 1){
      this.setState({allow: 1})
    }
    else{this.writeData();}
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
              onChange={(event) => this.doPassword(event.nativeEvent.text)}

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
                  onPress={this.scanToWebview}>
                  <Text style={styles.buttonText}>CONTINUE</Text>
              </TouchableOpacity>


              <TouchableOpacity onPress={() => this.setState({modalVisible: true})}>
                <Text style={styles.addusers}> + Add Users </Text>
              </TouchableOpacity>


              <Overlay visible={this.state.modalVisible} onClose={this.onClose} closeOnTouchOutside
            animationType="zoomIn" containerStyle={{backgroundColor: 'rgba(10, 10, 10, 0)'}}
            childrenWrapperStyle={styles.overlay}>
                {
                  (hideModal, overlayState) => (
                    <Fragment>
                      <View style={{flexDirection: 'row'}}>
                        <Text style={styles.overlay_title}>ADD A USER</Text>
                        <TouchableOpacity onPress={() => this.setState({modalVisible: false})} style={styles.closeButton}>
                          <Text> X </Text>
                        </TouchableOpacity>
                      </View>

                      <View style = {{flexDirection: 'row', alignSelf: 'center'}}>
                        <Text style={styles.overlay_up}> Username: </Text>
                        <TextInput
                          placeholder = 'Enter username'
                          placeholderTextColor = "gray"
                          autoCapitalize = "none"
                          autoCorrect = {false}
                          style= {[styles.inputBoxes, {fontStyle:'italic', borderBottomWidth: 1,
                          borderBottomColor: 'black', color:'black',}]}
                          onChange={(event) => this.setState({newUser: event.nativeEvent.text})}

                        />
                      </View>

                      <View style = {{flexDirection: 'row', alignSelf: 'center'}}>
                        <Text style={styles.overlay_up}> Password: </Text>
                        <TextInput
                          placeholder = 'Enter password'
                          placeholderTextColor = "gray"
                          autoCorrect = {false}
                          secureTextEntry={true}
                          autoCapitalize = "none"
                          style= {[styles.inputBoxes, {fontStyle:'italic', borderBottomWidth: 1,
                          borderBottomColor: 'black', color:'black',}]}
                          onChange={(event) => this.doPasswordNew(event.nativeEvent.text)}

                        />
                      </View>

                      <TouchableOpacity onPress={this.addUser}>
                        <Text style={{marginLeft: '80%', marginTop: 10}}> Apply </Text>
                      </TouchableOpacity>

                    </Fragment>
                  )
                }
                </Overlay>
          </View>
        )
      }

      else {
        if (this.state.ctype.trim() === "SSH"){
          var out = ''
          var z = 0
          var i = 0
          var j = 0
          //get the user, host, and password variables from the header
          var hd = this.state.header
          var u = hd.indexOf('user:')
          var hs = hd.indexOf('host:')
          var p = hd.indexOf('password:')
          var k = hd.indexOf('num_of_devices_paired:')
          var usr = hd.substring(u+5, hs-1)
          var hst = hd.substring(hs+5, p-1)
          var pass = hd.substring(p+9, k-1)
          var config ={user: usr ,host: hst, password: pass}

          var out_array = []
          var command_array = []
          var code = this.state.htmlCode

          var updated = code
          i = code.indexOf('$')
          while (i != -1){
            j = code.indexOf('$',i+1)
            var command = code.substring(i+1,j)

            command_array.push(command)

            SSH.execute(config,command).then(
              result => {
                out_array.push(result)
                if (out_array.length == command_array.length){
                  this.update_html(out_array,updated)
              }}
            )

            i = code.indexOf('$',j+1)

          }

          return (
            <View style={{backgroundColor:'black', flex:1}}>
              <WebView
                style = {styles.thing}
                source={{html: this.state.updated}}
                onMessage={event => {
                  this.changeSandP(config, event.nativeEvent.data);
                }}
              />
            </View>
          )
        }

        if (this.state.ctype.trim() === "BLE")
        {
          return(
            <WebView
              style = {styles.thing}
              source={{html: this.state.htmlCode}}
            />
          )
        }

        if (this.state.ctype.trim() === "WFI")
        {
          return(
            <WebView
              style = {styles.thing}
              source={{html: this.state.htmlCode}}
            />
          )
        }

        else {
          return(null)
        }
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
      width: 180,
      height: 40,
      justifyContent: 'center',
      marginTop: 30,
      marginLeft: 112,
      borderRadius: 20,
    },

    addusers: {
      color: 'white',
      marginTop: 100,
      marginLeft: '65%',
    },

    overlay: {
      height: '20%',
      marginTop: 210,
      borderRadius: 15,

    },

    overlay_title: {
      fontSize: 20,
      fontWeight: 'bold',
      justifyContent: 'center',
      textAlign: 'center',
      marginBottom: 20,

    },

    overlay_up: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'black'
    },

    closeButton: {
      marginLeft: '60%',
      fontWeight: 'bold',
    },
})

export default App;
