/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React ,{ Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button
} from 'react-native';

import { NativeModules, Platform } from 'react-native'

import { WebView } from 'react-native-webview';

var Aes = NativeModules.Aes;

import {routerCommand} from './nfcContent';

export default class App extends Component {

  constructor() {
    super();
    this.state = {
      dycryptedText: ''
    }
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
      this.generateKey('Arnold', 'salt', 5000, 256).then(key => {
          console.log('Key:', key)
          this.encrypt(routerCommand, key)
              .then(({ cipher, iv }) => {
                  console.log('Encrypted:', cipher)

                  this.decrypt({ cipher, iv }, key)
                      .then(text => {
                          console.log('Decrypted:', text)
                          this.setState({dycryptedText:text});
                      })
                      .catch(error => {
                          console.log(error)
                      })

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

  render() {
    // console.log(routerCommand)
    if (this.state.dycryptedText != ""){
      return (

          <WebView
          originWhitelist={['*']}
          source={{ html: this.state.dycryptedText }}
        />

      );
    }
    return (
      <View style={styles.container}>
        <Button
          title="Encrypt"
          onPress={ () => this.encryptFunction()}
        />
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
