import React from 'react';
import { View, Text, Button, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
    messages: [],
    uid: 0,
    user: {
      _id: '',
      avatar: '',
      name: '',
    },
    loggedInText: 'Please wait, you are getting logged in',
    image: null,
    location: null,
    isConnected: false,
  };
  

  if (!firebase.apps.length) {
    firebase.initializeApp ( {
    apiKey: "AIzaSyDmHG8qJ8S9WKkx2Z7Su-WXoBVu0utcrnI",
    authDomain: "chatapp-d6ab2.firebaseapp.com",
    databaseURL: "https://test-8b82a.firebaseio.com",
    projectId: "chatapp-d6ab2",
    storageBucket: "chatapp-d6ab2.appspot.com",
    messagingSenderId: "562901119321",
    });
  }

  //reference
  this.referenceChatMessages = firebase.firestore().collection('messages');
  }

  componentDidMount() {
    //For display of username
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });

    //Load messages with firebase

    NetInfo.fetch().then(connection => {
        if (connection.isConnected) {
            this.setState({
                isConnected: true,
            });
            console.log('online');


            //Anonymous user auth
            this.referenceChatMessages = firebase.firestore().collection('messages');


            this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
                if (!user) {
                    firebase.auth().signInAnonymously();
                }
                this.setState({
                    uid: user.uid,
                    messages: [],
                    user: {
                        _id: user.uid,
                        name: name,
                    },
                });
                this.unsubscribe = this.referenceChatMessages
                    .orderBy('createdAt', 'desc')
                    .onSnapshot(this.onCollectionUpdate);
                this.saveMessages();
            });
        }
        //display messages from asyncStorage
        else {
            this.setState({
                isConnected: false,
            });
            console.log('offline');
            this.getMessages();
        }
    })
}

componentWillUnmount() {
  if (this.isConnected) {
      this.unsubscribe();
      this.authUnsubscribe();
  }
}


  //halfnew
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }),
    () => {
      this.addMessage();
      this.saveMessages();
    }
  );
}

    //Save messages to database (new)
    addMessages = () => {
      const message = this.state.messages[0];
      this.referenceChatMessages.add({
          uid: this.state.uid,
          _id: message._id,
          text: message.text || '',
          createdAt: message.createdAt,
          user: message.user,
          image: message.image || null,
          location: message.location || null,
      });
  }

//new
onCollectionUpdate = (querySnapshot) => {
  const messages = [];
  // go through each document
  querySnapshot.forEach((doc) => {
    // get the QueryDocumentSnapshot's data
    let data = doc.data();
    messages.push({
      _id: data._id,
      text: data.text,
      createdAt: data.createdAt.toDate(),
      user: {
        _id: data.user._id,
        name: data.user.name,
        avatar: data.user.avatar || '',
      },
      image: data.image || null,
      location: data.location || null,
    });
  });
  this.setState({
    messages,
  });
};

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#000'
          }
        }}
      />
    )
  }

  
  render() {
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    const { bgColor } = this.props.route.params;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: bgColor,
        }}
      >
        <GiftedChat
         renderBubble={this.renderBubble.bind(this)}
  messages={this.state.messages}
  onSend={messages => this.onSend(messages)}
  user={{
    _id: 1,
  }}
/>
{ Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
 }
        <Text>Welcome to Chat! {name}</Text>
      </View>
    );
  }
}
