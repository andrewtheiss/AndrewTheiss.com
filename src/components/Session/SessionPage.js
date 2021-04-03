import React, {useState} from "react";
import { FirebaseContext } from '../Firebase';
import SignInForm from '../Session/SignInForm.js'

class SessionPage extends React.Component {

  render() {
    return (
      <FirebaseContext.Consumer>
        {firebase => <SignInForm firebase={firebase} />}
      </FirebaseContext.Consumer>
    )
  }
};
export default SessionPage;
