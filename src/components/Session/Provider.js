//import React, { Component, createContext } from "react";
//import { auth } from "../firebase";

//export const UserContext = createContext({ user: null });
// const provider = new firebase.auth.GoogleAuthProvider();
// https://blog.logrocket.com/user-authentication-firebase-react-apps/

// Figure out how to send SessionContext and FirebaseContext here!
import React from 'react';
class SessionProvider extends Component {
  state = {
    user: null
  };

  componentDidMount = () => {
    auth.onAuthStateChanged(userAuth => {
      this.setState({ user: userAuth});
    });
  };
  render() {
    return (
      <UserContext.Provider value={this.state.user}>
        {this.props.children}
      </UserContext.Provider>
    );
  }
}
export default SessionProvider;
