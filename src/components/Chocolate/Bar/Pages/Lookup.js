import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import MoldSizeMainPage from '../../MoldSize/Pages/MainPage.js'
import PackagingMainPage from '../../Packaging/Pages/MainPage.js'


class BarLookupPage extends React.Component {
  render() {
    return (
      <div>


          <FirebaseContext.Consumer>
            {firebase => <PackagingMainPage firebase={firebase} />}
          </FirebaseContext.Consumer>

        </div>
    );
  }
}

export default BarLookupPage;


/*

    ADD BACK TO RENDER

        <FirebaseContext.Consumer>
          {firebase => <BarLookup firebase={firebase} />}
        </FirebaseContext.Consumer>

        <FirebaseContext.Consumer>
          {firebase => <MoldSizeMainPage firebase={firebase} />}
        </FirebaseContext.Consumer>

        */
