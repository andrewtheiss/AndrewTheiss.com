import React from 'react';
import Navigation from '../Navigation/Navigation.js';
import './App.css';
import { FirebaseContext } from '../Firebase';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import * as ROUTES from '../../constants/routes.js'
import { withAuthentication } from '../Session';

// Import different pages to view based on routing
import SignInPage from '../Session/SignInPage.js'
import SignUpPage from '../Session/SignUpForm.js'

// Chocolate Pages
import IngredientPage from '../Chocolate/Ingredient/Pages/IngredientPage.js'
import BarLookupPage from '../Chocolate/Bar/Pages/Lookup.js'
import BarAddEditPage from '../Chocolate/Bar/Pages/AddEdit.js'
import BarConfigurePage from '../Chocolate/Bar/Pages/ConfigurePage.js'
import BeanMainPage from '../Chocolate/Bean/Pages/Main.js'
import AddEditChocolateBatchPage from '../Chocolate/Batch/Pages/AddEdit.js'
import TastingMainPage from '../Chocolate/Tasting/Pages/MainPage.js'
import TastingLookupPage from '../Chocolate/Tasting/Pages/Lookup.js'
import MeditationPage from '../Meditation/MainPage.js';
import ChocolateLandingPage from '../Chocolate/Pages/Landing.js';
import UsagePage from '../Usage/UsagePage.js';
import SplashPage from '../Splash/SplashPage.js';

const App = () => (
    <Router>
        <Navigation />
        <div className={window.location.pathname === ROUTES.LANDING ? 'splash-app-container' : 'app-container'}>
            {window.location.pathname === ROUTES.LANDING ? (
                <>
                    <Route exact path={ROUTES.LANDING} component={SplashPage} />
                </>
            ) : (
                <div className="page-shell">
                    <FirebaseContext.Consumer>
                        {firebase => <Route path={ROUTES.CHOCOLATE.BEAN} component={BeanMainPage} firebase={firebase} />}
                    </FirebaseContext.Consumer>
                    <FirebaseContext.Consumer>
                        {firebase => <Route path={ROUTES.CHOCOLATE.INGREDIENT} component={IngredientPage} firebase={firebase} />}
                    </FirebaseContext.Consumer>
                    <FirebaseContext.Consumer>
                        {firebase => <Route path={ROUTES.CHOCOLATE.INTENTION} component={IngredientPage} firebase={firebase} />}
                    </FirebaseContext.Consumer>
                    <FirebaseContext.Consumer>
                        {firebase => <Route path={ROUTES.CHOCOLATE.BATCH} component={AddEditChocolateBatchPage} firebase={firebase} />}
                    </FirebaseContext.Consumer>
                    <FirebaseContext.Consumer>
                        {firebase => <Route exact path={ROUTES.CHOCOLATE.BAR} component={BarLookupPage} firebase={firebase} />}
                    </FirebaseContext.Consumer>
                    <FirebaseContext.Consumer>
                        {firebase => <Route exact path={ROUTES.CHOCOLATE.BAR_LOOKUP} component={BarLookupPage} firebase={firebase} />}
                    </FirebaseContext.Consumer>
                    <FirebaseContext.Consumer>
                        {firebase => <Route exact path={ROUTES.CHOCOLATE.BAR_ADD_EDIT} component={BarAddEditPage} firebase={firebase} />}
                    </FirebaseContext.Consumer>
                    <FirebaseContext.Consumer>
                        {firebase => <Route exact path={ROUTES.CHOCOLATE.BAR_DEPENDENCIES} component={BarConfigurePage} firebase={firebase} />}
                    </FirebaseContext.Consumer>
                    <FirebaseContext.Consumer>
                        {firebase => <Route path={ROUTES.CHOCOLATE.TASTING} component={TastingLookupPage} firebase={firebase} />}
                    </FirebaseContext.Consumer>
                    <FirebaseContext.Consumer>
                        {firebase => <Route exact path={ROUTES.CHOCOLATE.TASTING_ROOT} component={TastingLookupPage} firebase={firebase} />}
                    </FirebaseContext.Consumer>
                    <FirebaseContext.Consumer>
                        {firebase => <Route exact path={ROUTES.CHOCOLATE.TASTING_ADD_EDIT} component={TastingMainPage} firebase={firebase} />}
                    </FirebaseContext.Consumer>
                    <Route exact path={ROUTES.CHOCOLATE.LANDING} component={ChocolateLandingPage} />
                    <Route path={ROUTES.SIGNUP} component={SignUpPage} />
                    <FirebaseContext.Consumer>
                        {firebase => <Route path={ROUTES.SIGNIN} component={SignInPage} firebase={firebase} />}
                    </FirebaseContext.Consumer>
                    <Route exact path={ROUTES.USAGE} component={UsagePage} />
                    <Route exact path={ROUTES.MEDITATION} component={MeditationPage} />
                </div>
            )}
        </div>
    </Router>
);
export default withAuthentication(App);
/*
https://reactrouter.com/web/example/nesting
https://reactrouter.com/web/example/auth-workflow
  */
