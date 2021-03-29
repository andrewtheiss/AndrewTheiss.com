import React from 'react';
import Navigation from '../Navigation/Navigation.js';
import './App.css';
import  { FirebaseContext } from '../Firebase';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import * as ROUTES from '../../constants/routes.js'

// Import different pages to view based on routing
import ChocolatePageTest from '../Chocolate/Pages/Test.js'
import ScriptsPage from '../Scripts/Pages/ScriptsPage.js'

// Temp imports for testing
import Bean from '../Chocolate/Bean/Bean.js'
import Chocolate from '../Chocolate/Chocolate/Chocolate.js'

class App extends React.Component {
  render() {
    return (
      <Router key="0" >
        <Navigation  />
        <div className="app-container">
          <FirebaseContext.Consumer>
                {firebase => <Route exact path={ROUTES.LANDING} component={ChocolatePageTest} firebase={firebase} />}
          </FirebaseContext.Consumer>
          <Route path={ROUTES.SCRIPTS} component={ScriptsPage} />
        </div>
      </Router>
    );
  }
}

export default App;

// https://colorlib.com/wp/free-simple-website-templates/
// https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial
