/* First NFC code for mifare ultralight */

/* input text: write something more and more and then ok
 * rendered: write something more and more and then ad i
 * anything more than this doesnt work already*/

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

const RouterInfo = 'Write this string on the nfc tag and read it afterwards to be stored in variable smd.';

class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            log: "Ready...",
            text: 'Write something more and more and then ok now what',
            code: "password",
            match: "Permission to connect to router: Denied"

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
                log: text
            })

            if (this.state.log == this.state.code) {
                this.setState({ match:"Permission to connect to router: Accepted" });
            }

            else {
              this.setState({ match:"Permission to connect to router: Denied" });
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
        return (
            <SafeAreaView style={styles.container}>
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
                    <Text>{this.state.match}</Text>
                </View>
            </SafeAreaView>
        )
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
    }
})

export default App;
