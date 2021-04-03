import React, {useState} from "react";
import SessionContext from './Context.js'

class SignInForm extends React.Component {
  static contextType = SessionContext;
  constructor(props) {
    super(props);
      console.log(this.contextType);

      console.log(this.props);
      console.log(this.props.session.context);
    this.handleGoogleLogin = this.handleGoogleLogin.bind(this);
    this.state = {isLoggedIn: this.props.session.isLoggedIn};
  }
  handleGoogleLogin() {
    var provider = new this.props.firebase.firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    this.props.firebase.auth.useDeviceLanguage();
    this.props.firebase.auth.signInWithPopup(provider)
    .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = credential.accessToken;
        // The signed-in user info.
        var user = result.user;

        var providerData = user.providerData[0];
        if (providerData.displayName == "Andrew Theiss" && providerData.email == "andrew.theiss@gmail.com") {
          this.props.session.user = providerData.uid;
          this.props.session.isLoggedIn = true;
          this.setState({isLoggedIn: true});

        } else {
          this.setState({isLoggedIn: false});
        }
    }).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });

  }
  render() {
    const isLoggedIn = this.state.isLoggedIn;
    let signIn = <div></div>;
    if (!isLoggedIn) {
      signIn = <div className="mt-8">
        <div>
          <button
            onClick={this.handleGoogleLogin}
            className="bg-red-500 hover:bg-red-600 w-full py-2 text-white">
            Sign in with Google
          </button>
        </div>
      </div>;
    }
    return (
      signIn
    )
  }
};
SignInForm.contextType = SessionContext;
export default SignInForm;
