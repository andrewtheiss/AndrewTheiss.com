import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { withFirebase } from '../Firebase';

import * as ROUTES from '../../constants/routes';

const SignUpPage = () => (
  <div>
    <h1>SignUp</h1>
    <SignUpForm />
  </div>
);
const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  error: null,
  ip: ''
};

const SignUpFormBase = ({ firebase, navigate }) => {
  const [state, setState] = React.useState({ ...INITIAL_STATE });

  const onSubmit = event => {
    event.preventDefault();
    const { email, passwordOne } = state;

    firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(() => {
        setState({ ...INITIAL_STATE });
        navigate(ROUTES.LANDING);
      })
      .catch(error => {
        setState((s) => ({ ...s, error }));
      });
  };

  const onChange = event => {
    const { name, value } = event.target;
    setState((s) => ({ ...s, [name]: value }));
  };

  const {
    username,
    email,
    passwordOne,
    passwordTwo,
    error,
  } = state;

  const isInvalid =
    passwordOne !== passwordTwo ||
    passwordOne === '' ||
    email === '' ||
    username === '';
  return (
    <form onSubmit={onSubmit}>
      <input
        name="username"
        value={username}
        onChange={onChange}
        type="text"
        placeholder="Full Name"
      />
      <input
        name="email"
        value={email}
        onChange={onChange}
        type="text"
        placeholder="Email Address"
      />
      <input
        name="passwordOne"
        value={passwordOne}
        onChange={onChange}
        type="password"
        placeholder="Password"
      />
      <input
        name="passwordTwo"
        value={passwordTwo}
        onChange={onChange}
        type="password"
        placeholder="Confirm Password"
      />
      <button disabled={isInvalid} type="submit">Sign Up</button>

      {error && <p>{error.message}</p>}
    </form>
  );
};

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGNUP}>Sign Up</Link>
  </p>
);

const SignUpForm = withFirebase((props) => {
  const navigate = useNavigate();
  return <SignUpFormBase {...props} navigate={navigate} />;
});

export default SignUpPage;

export { SignUpForm, SignUpLink };
