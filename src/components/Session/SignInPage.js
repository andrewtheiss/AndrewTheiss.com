import React from 'react';
import { withRouter } from 'react-router-dom';
//import { SignUpLink } from './SignUpForm';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

const SignInPage = () => (
 <div>
   <h1>SignIn</h1>
   <SignInForm />
 </div>
);

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};

class SignInFormBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = { INITIAL_STATE };
    this.handleGoogleLogin = this.handleGoogleLogin.bind(this);
  }
  handleGoogleLogin() {
    var provider = new this.props.firebase.firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    this.props.firebase.auth.useDeviceLanguage();
    this.props.firebase.auth.signInWithPopup(provider)
    .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        //var credential = result.credential;

        // This gives you a Google Access Token. You can use it to access the Google API.
        //var token = credential.accessToken;
        // The signed-in user info.
        var user = result.user;

        var providerData = user.providerData[0];
        if (providerData.displayName === "Andrew Theiss" && providerData.email === "andrew.theiss@gmail.com") {
          //this.props.session.user = providerData.uid;
        //  this.props.session.isLoggedIn = true;
          this.setState({isLoggedIn: true});
          this.props.history.push(ROUTES.LANDING);

        } else {
          this.props.history.push(ROUTES.LANDING);
        }
    }).catch((error) => {

        this.props.history.push(ROUTES.LANDING);
        // Handle Errors here.
      //  var errorCode = error.code;
        //var errorMessage = error.message;
        // The email of the user's account used.
      //  var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
      //  var credential = error.credential;
        // ...
    });

  }
  render() {
    const { email, password, error } = this.state;
    const isInvalid = password === '' || email === '';
    let signIn = <div className="mt-8">
        <div>
          <button
            onClick={this.handleGoogleLogin}
            className="bg-red-500 hover:bg-red-600 w-full py-2 text-white">
            Sign in with Google
          </button>
        </div>
      </div>;
    return (
      <div>
      {signIn}
      or
      <form onSubmit={this.onSubmit}>
        <input
          name="email"
          value={email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address"
        />
        <input
          name="password"
          value={password}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
        />
        <button disabled={isInvalid} type="submit">
          Sign In
        </button>

        {error && <p>{error.message}</p>}
      </form>
      </div>
    )
  }
};

const SignInForm = withRouter(withFirebase(SignInFormBase));

export default SignInPage;

export { SignInForm };
