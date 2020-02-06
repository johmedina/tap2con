/* This homepage is the latest one that only scans the tag for reading */
import React, { Component, Fragment } from 'react';
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

import Ionicons from 'react-native-vector-icons/Ionicons';
import Overlay from 'react-native-modal-overlay';

class App extends React.Component {
    state = {
    modalVisible: false,
    }
    constructor(props){
        super(props);
        this.state = {
            log: "Ready...",
            text: "",
            code: "password",
            match: "Denied"

        }
    }
    componentDidMount() {
        NfcManager.start();
    }

    componentWillUnmount() {
        this._cleanUp();
    }

    onClose = () => this.setState({ modalVisible: false});

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
        return (
            <SafeAreaView style={styles.container}>
                <TouchableOpacity style={styles.info} onPress={() => this.setState({modalVisible: true})}>
                  <Ionicons name="ios-information-circle" size={27} />
                </TouchableOpacity>

                <Text style={styles.textTitle}> To configure router: </Text>

                <TouchableOpacity
                    style={styles.buttonRead}
                    onPress={this.readData}>
                    <Text style={styles.buttonText}> SCAN NFC</Text>
                </TouchableOpacity>

                <View style={styles.log}>
                    <Text>{`Permission to Access Router: ${this.state.match}`}</Text>
                </View>

                <Overlay visible={this.state.modalVisible} onClose={this.onClose} closeOnTouchOutside
                  animationType="zoomIn" containerStyle={{backgroundColor: 'rgba(10, 10, 10, 0)'}}
                  childrenWrapperStyle={styles.filterContainer} >
                  {
                    (hideModal, overlayState) => (
                      <Fragment>
                          <View style={{flexDirection: 'row'}}>
                            <Text style={styles.filterTitle}>ABOUT</Text>
                            <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
                              <Ionicons name="ios-close" size={27} color="white" />
                            </TouchableOpacity>
                          </View>

                          <View>
                            <Text style={styles.body}>
                              This application uses Augmented Reality to configure an OpenWRT
                              router. To start, scan the phone to the NFC reader attached on the
                              router. {'\n'}{'\n'}
                              Disclaimer: Only authorized users will have access to the router.
                            </Text>
                          </View>

                          <View style={{marginTop: 300}}>
                            <Text style={styles.footer}>
                              Developers: Johanne Medina, Kenana Dalle, Mohammad Al-Sooj{'\n'}
                              Supervisor: Dr. Ala Al-Fuqaha {'\n'}
                              Hamad bin Khalifa University
                            </Text>
                          </View>
                      </Fragment>
                    )
                  }
                </Overlay>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },

    textTitle: {
        color: 'black',
        marginTop: 250,
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 18,
    },

    buttonRead: {
        marginLeft: 20,
        marginRight: 20,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: 'black',
    },
    buttonText: {
        color: 'white',
        fontSize: 25
    },
    log: {
        marginTop: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },

    info: {
      marginTop: 20,
      marginLeft: '90%',
    },

    filterContainer: {
    backgroundColor: 'rgba(50, 50, 50, 0.95)',
    height: '70%',
    },

    filterTitle: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 23,
      marginBottom: 5,
    },

    closeButton: {
    marginLeft: "70%",
    },

    body: {
      color: 'white',
      marginTop: 10,
    },

    footer: {
      color: 'white',
      marginTop: 10,
      textAlign: 'center',
    }
})

export default App;
