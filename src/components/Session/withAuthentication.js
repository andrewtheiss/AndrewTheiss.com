import React from 'react';
import AuthUserContext from './context';
import { withFirebase } from '../Firebase';

const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        authUser : {
          admin: false,
          auth : false
        }
      };
    }
    componentDidMount() {
      this.props.firebase.auth.onAuthStateChanged(authUser => {

        if (!authUser) {
          this.setState({
            authUser : {
              admin: false,
              auth : false
            }
          });
        } else {
          var providerData = authUser.providerData[0];
          if (providerData.displayName == "Andrew Theiss" && providerData.email == "andrew.theiss@gmail.com") {
            this.setState({
              authUser : {
                admin: true,
                auth : true
              }
            });
          } else {
            this.setState({
              authUser : {
                admin: false,
                auth : true
              }
            });
          }
        }
      });
    }
    componentWillUnmount() {
      this.listener();
    }
    render() {
      console.log(this.state);
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
