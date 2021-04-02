import React from 'react';
import Navigation from '../Navigation/Navigation.js';
import './App.css';
import { FirebaseContext } from '../Firebase';
import { SessionContext } from '../Session';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import * as ROUTES from '../../constants/routes.js'

// Import different pages to view based on routing
import ChocolatePageTest from '../Chocolate/Pages/Test.js'
import ScriptsPage from '../Scripts/Pages/ScriptsPage.js'
import InventoryPage from '../Chocolate/Inventory/InventoryPage.js'
import SessionPage from '../Session/SessionPage.js'

// Temp imports for testing
import Bean from '../Chocolate/Bean/Bean.js'
import Chocolate from '../Chocolate/Chocolate/Chocolate.js'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isLoggedIn: false};
  }
  render() {
    return (
      <Router key="0" >
        <Navigation  />
        <div className="app-container">
          <FirebaseContext.Consumer>
                {firebase => <Route exact path={ROUTES.LANDING} component={ChocolatePageTest} firebase={firebase} />}
          </FirebaseContext.Consumer>
          <Route path={ROUTES.SCRIPTS} component={ScriptsPage} />
          <Route path={ROUTES.INVENTORY} component={InventoryPage} />
          <FirebaseContext.Consumer>
            {firebase =>
            <SessionContext.Consumer>
              {session => <Route path={ROUTES.SIGNIN} component={SessionPage} firebase={firebase} session={session} />}
            </SessionContext.Consumer>
            }
          </FirebaseContext.Consumer>
        </div>
      </Router>
    );
  }
}

export default App;
