import React, {useState} from "react";
import { FirebaseContext } from '../Firebase';
import { SessionContext } from '../Session';
import SignInForm from '../Session/SignInForm.js'

class SessionPage extends React.Component {

  render() {
    return (
      <FirebaseContext.Consumer>
        {firebase =>
        <SessionContext.Consumer>
          {session => <SignInForm firebase={firebase} session={session} />}
        </SessionContext.Consumer>
        }
      </FirebaseContext.Consumer>
    )
  }
};
export default SessionPage;
