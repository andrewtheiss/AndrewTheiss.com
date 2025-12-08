import React from 'react';
import { withRouter } from 'react-router-dom';
//import { SignUpLink } from './SignUpForm';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

const SignInPage = () => (
  <div>
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
    this.state = { ...INITIAL_STATE };
  }

  handleGoogleLogin = async () => {
    try {
      await this.props.firebase.doGoogleSignIn();
      this.props.history.push(ROUTES.LANDING);
    } catch (error) {
      this.setState({ error });
    }
  };

  onSubmit = async (event) => {
    event.preventDefault();
    const { email, password } = this.state;
    try {
      await this.props.firebase.doSignInWithEmailAndPassword(email, password);
      this.setState({ ...INITIAL_STATE });
      this.props.history.push(ROUTES.LANDING);
    } catch (error) {
      this.setState({ error });
    }
  };

  onChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  render() {
    const { email, password, error } = this.state;
    const isInvalid = password === '' || email === '';
    return (
      <div>
        <div className="mt-8">
          <div>
            <button
              onClick={this.handleGoogleLogin}
              className="dark-button"
              type="button"
            >
              Sign in with Google
            </button>
          </div>
        </div>
        <div className="mt-4">or</div>
        <form onSubmit={this.onSubmit}>
          <input
            name="email"
            value={email}
            onChange={this.onChange}
            type="text"
            placeholder="Email Address"
            className="dark-input"
          />
          <input
            name="password"
            value={password}
            onChange={this.onChange}
            type="password"
            placeholder="Password"
            className="dark-input"
          />
          <button className="dark-button" disabled={isInvalid} type="submit">
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
