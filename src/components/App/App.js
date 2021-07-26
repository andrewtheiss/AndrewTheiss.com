import React from 'react';
import Navigation from '../Navigation/Navigation.js';
import './App.css';
import { FirebaseContext } from '../Firebase';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import * as ROUTES from '../../constants/routes.js'
import { withFirebase } from '../Firebase';
import { withAuthentication } from '../Session';
import { AuthUserContext } from '../Session';

// Import different pages to view based on routing
import ChocolatePageTest from '../Chocolate/Pages/Test.js'
import ScriptsPage from '../Scripts/Pages/ScriptsPage.js'
import InventoryPage from '../Chocolate/Inventory/InventoryPage.js'
import SignInPage from '../Session/SignInPage.js'
import SignUpPage from '../Session/SignUpForm.js'


const App = () => (
  <Router>
    <Navigation />

    <div className="app-container">
      <FirebaseContext.Consumer>
            {firebase => <Route exact path={ROUTES.LANDING} component={ChocolatePageTest} firebase={firebase} />}
      </FirebaseContext.Consumer>
      <Route path={ROUTES.SCRIPTS} component={ScriptsPage} />
      <FirebaseContext.Consumer>
          {firebase => <Route path={ROUTES.INVENTORY} component={InventoryPage} firebase={firebase} />}
      </FirebaseContext.Consumer>
      <Route path={ROUTES.SIGNUP} component={SignUpPage} />
      <FirebaseContext.Consumer>
        {firebase => <Route path={ROUTES.SIGNIN} component={SignInPage} firebase={firebase} />}
      </FirebaseContext.Consumer>
    </div>
  </Router>
);
export default withAuthentication(App);
