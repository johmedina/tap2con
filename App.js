/* First NFC code for mifare ultralight */

/* NFC and router stuff version 1*/

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
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import HTML from 'react-native-render-html';
import SSH from 'react-native-ssh';

config = {user: 'root',host: '192.168.1.1',password: 'admin'}
command = 'ls'

class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            log: "Ready...",
            text: '<p>$cd ..\ncat tmp/dhcp.leases$</p>',
            code: "password",
            match: "Denied",
            allow: 0,
            retvalue: '',

        }
    }
    componentDidMount() {
        NfcManager.start();
    }

    componentWillUnmount() {
        this._cleanUp();
    }

    _cleanUp = () => {
        NfcManager.cancelTechnologyRequest().catch(() => 0);
    }

    readData = async () => {
        try {
            let tech = Platform.OS === 'ios' ? NfcTech.MifareIOS : NfcTech.NfcA;
            let resp = await NfcManager.requestTechnology(tech, {
                alertMessage: 'Ready to do some custom Mifare cmd!'
            });

            let cmd = Platform.OS === 'ios' ? NfcManager.sendMifareCommandIOS : NfcManager.transceive;

            resp = await cmd([0x3A, 4, 4]);
            let payloadLength = parseInt(resp.toString().split(",")[1]);
            let payloadPages = Math.ceil(payloadLength / 4);
            let startPage = 5;
            let endPage = startPage + payloadPages - 1;

            resp = await cmd([0x3A, startPage, endPage]);
            let bytes = resp.toString().split(",");
            let text = "";

            for(let i=0; i<bytes.length; i++){
                if (i < 5){
                    continue;
                }

                if (parseInt(bytes[i]) === 254){
                    break;
                }

                text = text + String.fromCharCode(parseInt(bytes[i]));

            }

            this.setState({
                log: text,
                allow: 1,
            })

            if (this.state.allow) {
                this.setState({ match:"Accepted" });
            }

            else {
              this.setState({ match:"Denied" });
            }


            this._cleanUp();
        } catch (ex) {
            this.setState({
                log: ex.toString()
            })
            this._cleanUp();
        }
    }

    writeData = async () => {
        if (!this.state.text){
            Alert.alert("Nothing to write");
            return;
        }
        try {
            let tech = Platform.OS === 'ios' ? NfcTech.MifareIOS : NfcTech.NfcA;
            let resp = await NfcManager.requestTechnology(tech, {
                alertMessage: 'Ready to do some custom Mifare cmd!'
            });

            let text = this.state.text;
            let fullLength = text.length + 7;
            let payloadLength = text.length + 3;

            let cmd = Platform.OS === 'ios' ? NfcManager.sendMifareCommandIOS : NfcManager.transceive;

            resp = await cmd([0xA2, 0x04, 0x03, fullLength, 0xD1, 0x01]); // 0x0C is the length of the entry with all the fluff (bytes + 7)
            resp = await cmd([0xA2, 0x05, payloadLength, 0x54, 0x02, 0x65]); // 0x54 = T = Text block, 0x08 = length of string in bytes + 3

            let currentPage = 6;
            let currentPayload = [0xA2, currentPage, 0x6E];

            for(let i=0; i<text.length; i++){
                currentPayload.push(text.charCodeAt(i));
                if (currentPayload.length == 6){
                    resp = await cmd(currentPayload);
                    currentPage += 1;
                    currentPayload = [0xA2, currentPage];
                }
            }

            // close the string and fill the current payload
            currentPayload.push(254);
            while(currentPayload.length < 6){
                currentPayload.push(0);
            }

            resp = await cmd(currentPayload);

            this.setState({
                log: resp.toString()
            })

            this._cleanUp();
        } catch (ex) {
            this.setState({
                log: ex.toString()
            })
            this._cleanUp();
        }
    }

    onChangeText = (text) => {
        this.setState({
            text
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

        return <View style = {styles.thing}><HTML html = {updated}/></View>
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
