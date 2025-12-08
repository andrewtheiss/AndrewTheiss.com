import React from 'react';
import AuthUserContext from './context';
import { withFirebase } from '../Firebase';

const ADMIN_EMAILS = ['andrew.theiss@gmail.com'];

const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        authUser: {
          admin: false,
          auth: false,
          user: null,
          loading: true,
        },
      };
    }
    componentDidMount() {
      this.listener = this.props.firebase.onAuthStateChanged((authUser) => {
        if (!authUser) {
          this.setState({
            authUser: {
              admin: false,
              auth: false,
              user: null,
              loading: false,
            },
          });
          return;
        }

        const isAdmin = ADMIN_EMAILS.includes(authUser.email);
        this.setState({
          authUser: {
            admin: isAdmin,
            auth: true,
            user: authUser,
            loading: false,
          },
        });
      });
    }
    componentWillUnmount() {
      if (this.listener) {
        this.listener();
      }
    }
    render() {
      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return withFirebase(WithAuthentication);
};

export default withAuthentication;
