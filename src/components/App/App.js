import React, { Component } from 'react';
import Navigation from '../Navigation/Navigation.js';
import './App.css';
import { FirebaseContext } from '../Firebase';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import * as ROUTES from '../../constants/routes.js'
import { withFirebase } from '../Firebase';
import { AuthUserContext } from '../Session';

// Import different pages to view based on routing
import ChocolatePageTest from '../Chocolate/Pages/Test.js'
import ScriptsPage from '../Scripts/Pages/ScriptsPage.js'
import InventoryPage from '../Chocolate/Inventory/InventoryPage.js'
import SignInPage from '../Session/SignInPage.js'
import SignUpPage from '../Session/SignUpForm.js'

// Temp imports for testing
import Bean from '../Chocolate/Bean/Bean.js'
import Chocolate from '../Chocolate/Chocolate/Chocolate.js'

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      authUser: null,
      adminUser : null
    };
  }
  componentDidMount() {
    this.props.firebase.auth.onAuthStateChanged(authUser => {

      if (!authUser) {
        this.setState({ authUser: null });
        this.setState({ adminUser: false });
      } else {
        this.setState({ authUser });
        var providerData = authUser.providerData[0];
        if (providerData.displayName == "Andrew Theiss" && providerData.email == "andrew.theiss@gmail.com") {
            this.setState({ adminUser: true });
        } else {
          this.setState({ adminUser: null });
        }
      }
    });
  }
  componentWillUnmount() {
    this.listener();
  }
  render() {
    return (
       <AuthUserContext.Provider value={this.state.authUser} admin={this.state.adminUser}>
          <Router key="0" >
            <FirebaseContext.Consumer>
              {firebase =>  <Navigation authUser={this.state.authUser} adminUser={this.state.adminUser} firebase={firebase} />}
            </FirebaseContext.Consumer>

            <div className="app-container">
              <FirebaseContext.Consumer>
                    {firebase => <Route exact path={ROUTES.LANDING} component={ChocolatePageTest} firebase={firebase} />}
              </FirebaseContext.Consumer>
              <Route path={ROUTES.SCRIPTS} component={ScriptsPage} />
              <Route path={ROUTES.INVENTORY} component={InventoryPage} adminUser={this.state.adminUser} />
              <Route path={ROUTES.SIGNUP} component={SignUpPage} />
              <FirebaseContext.Consumer>
                {firebase => <Route path={ROUTES.SIGNIN} component={SignInPage} firebase={firebase} />}
              </FirebaseContext.Consumer>
            </div>
          </Router>
        </AuthUserContext.Provider>
    );
  }
}

export default withFirebase(App);
