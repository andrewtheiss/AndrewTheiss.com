import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const SignInFormBase = ({ firebase, navigate }) => {
  const [state, setState] = useState({ ...INITIAL_STATE });
  const isDesktopShell = firebase?.isDesktopShell?.() || false;

  const handleGoogleLogin = async () => {
    try {
      if (isDesktopShell && firebase.doDesktopOAuth) {
        await firebase.doDesktopOAuth();
      } else {
        await firebase.doGoogleSignIn();
      }
      navigate(ROUTES.LANDING);
    } catch (error) {
      setState((s) => ({ ...s, error }));
    }
  };

  const handleGoogleRedirect = async () => {
    try {
      if (isDesktopShell && firebase.doDesktopOAuth) {
        await firebase.doDesktopOAuth();
      } else {
        await firebase.doGoogleRedirect();
      }
      navigate(ROUTES.LANDING);
    } catch (error) {
      setState((s) => ({ ...s, error }));
    }
  };

  React.useEffect(() => {
    // Handle redirect result once; actual auth state is handled globally in withAuthentication
    firebase.handleRedirectResult?.();
  }, [firebase]);

  const onSubmit = async (event) => {
    event.preventDefault();
    const { email, password } = state;
    try {
      await firebase.doSignInWithEmailAndPassword(email, password);
      setState({ ...INITIAL_STATE });
      navigate(ROUTES.LANDING);
    } catch (error) {
      setState((s) => ({ ...s, error }));
    }
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setState((s) => ({ ...s, [name]: value }));
  };

  const { email, password, error } = state;
  const isInvalid = password === '' || email === '';

  return (
    <div>
      <div className="mt-8">
        <div>
          <button
            onClick={handleGoogleLogin}
            className="dark-button"
            type="button"
          >
            {isDesktopShell ? 'Sign in with Google (desktop)' : 'Sign in with Google'}
          </button>
          <button
            onClick={handleGoogleRedirect}
            className="dark-button"
            type="button"
            style={{ marginLeft: '8px' }}
            disabled={isDesktopShell}
          >
            Google (redirect)
          </button>
        </div>
      </div>
      <div className="mt-4">or</div>
      <form onSubmit={onSubmit}>
        <input
          name="email"
          value={email}
          onChange={onChange}
          type="text"
          placeholder="Email Address"
          className="dark-input"
        />
        <input
          name="password"
          value={password}
          onChange={onChange}
          type="password"
          placeholder="Password"
          className="dark-input"
        />
        <button className="dark-button" disabled={isInvalid} type="submit">
          Sign In
        </button>

        {error && <p>{error.message}</p>}
      </form>
      <div className="mt-4">
        <Link to={ROUTES.MEDITATION} className="dark-button">
          Go to Meditation
        </Link>
      </div>
    </div>
  );
};

const SignInForm = withFirebase((props) => {
  const navigate = useNavigate();
  return <SignInFormBase {...props} navigate={navigate} />;
});

export default SignInPage;

export { SignInForm };
