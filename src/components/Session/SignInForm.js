import React, {useState} from "react";

class SignInForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleGoogleLogin = this.handleGoogleLogin.bind(this);
    this.state = {isLoggedIn: false};
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

export default SignInForm;
