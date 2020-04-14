# tap2con
# Leveraging Near Field Communication and Cross-Platform Mobile Applications to Simplify the Configuration of Internet of Things Devices and Services
-------------
## Abstract
The Internet of Things (IoT) aims to interconnect devices with each other. A challenge faced is that each mobile phone application must be developed for each IoT device separately. With each IoT device, a new application is required to fit its standards and to allow the user to control it. There is not much literature available on decoupling a mobile application from the device such that the application is independent and agnostic of the functionality and user interface. This project aims to solve that problem by creating a mobile application that can understand and communicate with any IoT device. This is done by utilizing Near Field Communication (NFC) technology. NFC is a seamless and intuitive communication method that establishes the connection with the given IoT device; the NFC tags come in small form factor and can be attached to the device. Three requirements of this project include decoupling, security, and user-friendliness. These requirements are accounted for by having the app render HTML5, JavaScript and CSS3 stored on the NFC tags which is fully encrypted while making sure that the user is within a proximity to the IoT device to be configured. To guarantee that specific users can access the important data, a secure user authentication process is implemented. The work presented here provides an efficient and easy way to use an application that fits all devices.

## Introduction
Internet of Things is one of today's fastest growing trends in technology. It involves the communication of things to the internet by having microprocessors embedded within them that can send and receive data. Commonly, these things are referred to as smart-something and can literally be any object you can think of including lights, television, microwave, chairs, and wearable technology, among others. These objects are usually controlled and configured using mobile phone applications. Some of the common challenges related to this, however, include downloading multiple mobile apps to control different IoT objects, counter-intuitive user interface, and the risk of a breach of security and privacy.

![](https://i.ibb.co/n6fxdJk/Decoupling.png)

> Decoupling Demonstartion.

#### Hardware:
- NFC 32KB NDEF Card
- Mifare Ultralight and Classic 1k NFC tags
- openWRT Router – Linksys 
- iPhone X or newer with iOS 13
- Android phone with ARCore 
#### Software:
+ React Native
  + react-native-nfc-manager
  + react-native-ssh
  + react-native-webview
  + react-native-hash
  + react-native-aes-crypto
  + react-native-modal-overlay
+ Atom / VisualStudio Text Editor 
+ Xcode 
+ Android Studio

## Instructions
#### 1. Install Dependencies.
In your local project folder, install the dependencies in the node_modules folder.
Go to the project dirctory in terminal and type the following:

`$ npm install`

#### 2. Intall Pods
Make sure you have CocoaPods installed. If you do not, make sure you install it using the following:

`$ sudo gem install cocoapods`

From within your project directory, navigate to the ios directory:

`$ cd ios`

Install the pods required for the project:

`$ pod install`

With this you can go to Xcode and run the application on your iPhone. The applicaiton is dependant on NFC hardware so it will not work as expected in the iOS simulator.

Enjoy!

