{/* Only router stuff version 1 */}

import React, {ReactHTML} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Button,
} from 'react-native';

import HTML from 'react-native-render-html'
import SSH from 'react-native-ssh'



const htmlcont = '<h1>$ip r§</h1> '

config = {user: 'root',host: '192.168.1.1',password: 'admin'}
command = 'ls'

class App extends React.Component {
  constructor(props){
    super(props)
  }
  state = {
    ispressed: false,
    text: ''
  };
  renderui(){
    this.setState({
      ispressed: true
    })


  }
  render(){
    if (!this.state.ispressed){
    return(
      <View style = {styles.text}>
        <Button onPress = {this.renderui.bind(this)} title = 'press to render new page'/>
      </View>

    )
    }
    else {
      //RNFS.readFile('Users/kenana/Desktop/seniordesign/htmlpage').then((res) => {
      //  console.log('read file res: ',res);
      //})
      var i = htmlcont.indexOf('$')
      var j = htmlcont.indexOf('§')
      var cmd = htmlcont.substring(i+1,j)

      console.log(cmd)
      SSH.execute(config,cmd).then(result => this.setState({text: result}))
      console.log(this.state.text)
      var updated = htmlcont.replace(htmlcont.substring(i,j+1),this.state.text)
      console.log(updated)
      return <View style = {styles.text}><HTML html = {updated}/></View>
    }

  }

}

const styles = StyleSheet.create({
  text:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }

})


export default App;
