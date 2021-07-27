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
import ScriptsPage from '../Scripts/Pages/ScriptsPage.js'
import SignInPage from '../Session/SignInPage.js'
import SignUpPage from '../Session/SignUpForm.js'

// Chocolate Pages
import IngredientPage from '../Chocolate/Ingredient/Pages/IngredientPage.js'
import BarLookupPage from '../Chocolate/Bar/Pages/Lookup.js'
import BeanLookupPage from '../Chocolate/Bean/Pages/Lookup.js'


const App = () => (
  <Router>
    <Navigation />

    <div className="app-container">
      <FirebaseContext.Consumer>
            {firebase => <Route exact path={ROUTES.LANDING} component={BeanLookupPage} firebase={firebase} />}
      </FirebaseContext.Consumer>
      <Route path={ROUTES.SCRIPTS} component={ScriptsPage} />
      <FirebaseContext.Consumer>
          {firebase => <Route path={ROUTES.CHOCOLATE.BEAN} component={BeanLookupPage} firebase={firebase} />}
      </FirebaseContext.Consumer>
      <FirebaseContext.Consumer>
          {firebase => <Route path={ROUTES.CHOCOLATE.INGREDIENT} component={IngredientPage} firebase={firebase} />}
      </FirebaseContext.Consumer>
      <FirebaseContext.Consumer>
          {firebase => <Route path={ROUTES.CHOCOLATE.COMPARISON} component={IngredientPage} firebase={firebase} />}
      </FirebaseContext.Consumer>
      <FirebaseContext.Consumer>
          {firebase => <Route path={ROUTES.CHOCOLATE.BATCH} component={IngredientPage} firebase={firebase} />}
      </FirebaseContext.Consumer>
      <FirebaseContext.Consumer>
          {firebase => <Route path={ROUTES.CHOCOLATE.BAR} component={BarLookupPage} firebase={firebase} />}
      </FirebaseContext.Consumer>
      <FirebaseContext.Consumer>
          {firebase => <Route path={ROUTES.CHOCOLATE.TASTING} component={IngredientPage} firebase={firebase} />}
      </FirebaseContext.Consumer>
      <Route path={ROUTES.SIGNUP} component={SignUpPage} />
      <FirebaseContext.Consumer>
        {firebase => <Route path={ROUTES.SIGNIN} component={SignInPage} firebase={firebase} />}
      </FirebaseContext.Consumer>
    </div>
  </Router>
);
export default withAuthentication(App);
/*
https://reactrouter.com/web/example/nesting
https://reactrouter.com/web/example/auth-workflow
  */
