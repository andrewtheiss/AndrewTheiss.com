import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import MoldSizeMainPage from '../../MoldSize/Pages/MainPage.js'
import PackagingMainPage from '../../Packaging/Pages/MainPage.js'
import IntentionMainPage from '../../Intention/Pages/MainPage.js'
import TastingMainPage from '../../Tasting/Pages/MainPage.js'


class BarConfigurePage extends React.Component {
  render() {
    return (
      <div>
        <FirebaseContext.Consumer>
          {firebase => <TastingMainPage firebase={firebase} />}
        </FirebaseContext.Consumer>
          <FirebaseContext.Consumer>
            {firebase => <IntentionMainPage firebase={firebase} />}
          </FirebaseContext.Consumer>
        <FirebaseContext.Consumer>
          {firebase => <PackagingMainPage firebase={firebase} />}
        </FirebaseContext.Consumer>
        <FirebaseContext.Consumer>
          {firebase => <MoldSizeMainPage firebase={firebase} />}
        </FirebaseContext.Consumer>
        </div>
    );
  }
}

export default BarConfigurePage;
