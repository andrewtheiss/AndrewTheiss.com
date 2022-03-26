import React from 'react';
import { ethers } from "ethers";
var urllib = require('urllib');

class TaxesOverviewMainPage extends React.Component {
  constructor(props) {
    super(props);
    this.runSafetyNetLogin = this.runSafetyNetLogin.bind(this);
    this.state = {
      sent : false
    };
  }
  runSafetyNetLogin(event) {
    const self = this;
    var email = "atheiss@hw.com";
    const reqData = {"institutionCode":"-MB1IFwURWd94j_j3yYN","templateCode":"-MBFe7iMR5LMi2YGvpsI","questions":[{"isActive":true,"isTriggerNotificationReversed":false,"label":"Your Name","questionCode":"-MK6sE2OOqgtO9Zh73uv","sequence":1,"tag":"senderName","type":"text","willSendNotification":false,"answer":"ANDREW S THEISS"},{"isActive":true,"isTriggerNotificationReversed":false,"label":"Your Email","questionCode":"-MK6sE2PKtJkEUN5FeZJ","sequence":2,"tag":"senderEmail","type":"email","willSendNotification":false,"subQuestions":[],"answer":email},{"isActive":true,"isTriggerNotificationReversed":false,"label":"Secondary Email","questionCode":"-MK6sE2PKtJkEUN5FeZK","sequence":3,"tag":"senderAlternateEmail","type":"email","willSendNotification":false,"subQuestions":[],"answer":email},{"isActive":true,"isTriggerNotificationReversed":false,"label":"Your Mobile Number","questionCode":"-MK6sE2PKtJkEUN5FeZL","sequence":4,"tag":"senderMobileNumber","type":"text","willSendNotification":false,"answer":"5309661866"},{"isActive":true,"isTriggerNotificationReversed":false,"label":"Do you have or have you recently had any of the following: fever, chills, sweats, new or worsening cough, headache, sore throat?","questionCode":"-MBFe7hJS8KU90sU2NLv","sequence":5,"tag":"userDefined","type":"boolean","willSendNotification":true,"answer":false},{"isActive":true,"isTriggerNotificationReversed":false,"label":"Are you experiencing or have you recently experienced general fatigue, muscle or body aches, shortness of breath, difficulty breathing, loss of taste or smell, nausea, or diarrhea?","questionCode":"-MS-X8v7Zn4FUV-QSWZa","sequence":6,"tag":"userDefined","type":"boolean","willSendNotification":true,"answer":false},{"isActive":false,"isTriggerNotificationReversed":false,"label":"Do you have a fever above 100F?","questionCode":"-MBFe7hJS8KU90sU2NLt","sequence":7,"tag":"userDefined","type":"boolean","willSendNotification":false,"answer":false},{"isActive":true,"isTriggerNotificationReversed":false,"label":"What is your current temperature?","questionCode":"-MBFe7hJS8KU90sU2NLu","sequence":8,"tag":"userDefined","type":"text","willSendNotification":false,"answer":"CA"},{"isActive":false,"isTriggerNotificationReversed":false,"label":"Have you taken medication in the last 24 hours for flu-like symptoms?","questionCode":"-MBFe7hK_7_feargIG9R","sequence":9,"tag":"userDefined","type":"boolean","willSendNotification":false,"answer":false},{"isActive":false,"isTriggerNotificationReversed":false,"label":"Please list medication","questionCode":"-MBFe7hK_7_feargIG9S","sequence":10,"tag":"userDefined","type":"text","willSendNotification":false,"answer":""},{"isActive":true,"isTriggerNotificationReversed":false,"label":"Have you traveled outside of California in the last 10 days?","questionCode":"-MBFe7hK_7_feargIG9T","sequence":11,"tag":"userDefined","type":"boolean","willSendNotification":true,"answer":false},{"isActive":false,"isTriggerNotificationReversed":false,"label":"If yes, where?","questionCode":"-MBFe7hK_7_feargIG9U","sequence":12,"tag":"userDefined","type":"text","willSendNotification":false,"answer":""},{"isActive":true,"isTriggerNotificationReversed":false,"label":"Have you engaged in any conduct over the last two weeks that violates community health standards, such as attending a social gathering with members of many households or spending time with others unmasked (including club sports)?","questionCode":"-MBFe7hK_7_feargIG9V","sequence":13,"tag":"userDefined","type":"boolean","willSendNotification":true,"answer":false},{"isActive":false,"isTriggerNotificationReversed":false,"label":"If yes, please describe","questionCode":"-MBFe7hK_7_feargIG9W","sequence":14,"tag":"userDefined","type":"text","willSendNotification":false,"answer":""},{"isActive":false,"isTriggerNotificationReversed":false,"label":"Have you participated in a club sports event in the last 10 days in which you or other athletes were unmasked or during which you had close contact for fifteen minutes or more with another athlete? ","questionCode":"-MIdu-08zl6KRNo7uDXV","sequence":15,"tag":"userDefined","type":"boolean","willSendNotification":false,"answer":false},{"isActive":true,"isTriggerNotificationReversed":false,"label":"Have you been in a social situation other than club sports in the last 14 days in which you did not wear a mask and/or practice good social distancing?","questionCode":"-MBFe7hK_7_feargIG9X","sequence":16,"tag":"userDefined","type":"boolean","willSendNotification":true,"answer":false},{"isActive":false,"isTriggerNotificationReversed":false,"label":"If yes, please describe","questionCode":"-MBFe7hK_7_feargIG9Y","sequence":17,"tag":"userDefined","type":"text","willSendNotification":false,"answer":""},{"isActive":true,"isTriggerNotificationReversed":false,"label":"Have you been in contact with anyone confirmed to have COVID-19 in the past 14 days?","questionCode":"-MBFe7hK_7_feargIG9Z","sequence":18,"tag":"userDefined","type":"boolean","willSendNotification":true,"answer":false},{"isActive":false,"isTriggerNotificationReversed":false,"label":"If yes, please describe","questionCode":"-MNP6Va49TeB1u5FnY12","sequence":19,"tag":"userDefined","type":"text","willSendNotification":false,"answer":""},{"isActive":false,"isTriggerNotificationReversed":false,"label":"Have you been in contact with someone who has any of the symptoms listed above?","questionCode":"-MBFe7hK_7_feargIG9a","sequence":20,"tag":"userDefined","type":"boolean","willSendNotification":false,"answer":false},{"isActive":false,"isTriggerNotificationReversed":false,"label":"If yes, please describe","questionCode":"-MNP6Va49TeB1u5FnY13","sequence":21,"tag":"userDefined","type":"text","willSendNotification":false,"answer":""},{"isActive":false,"isTriggerNotificationReversed":false,"label":"Have you been tested for COVID anywhere other than at Harvard-Westlake in the last 14 days?","questionCode":"-MS9JrZdOkvN4Jlg-8SA","sequence":22,"tag":"userDefined","type":"boolean","willSendNotification":false,"answer":false},{"isActive":true,"isTriggerNotificationReversed":false,"label":"Do you want to talk with a member of the Community Health Office to discuss your health status? If you have any concerns or are uncertain about your answers to the questions above, please select YES.","questionCode":"-MVFdN-lpP5aZHJU0d0u","sequence":23,"tag":"userDefined","type":"boolean","willSendNotification":true,"answer":false}]};
    console.log(reqData);

    urllib.request('https://us-central1-safety-app-d300e.cloudfunctions.net/exposedSubmitFormAnswer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        dataType: 'json',
        data: reqData
      }, function (err, data, res) {
        self.setState({sent:true});
      }
    );

  }
  render() {
    return (
      <div className="scripts-page">
      <h1>Transactions</h1>
      <button onClick={this.runSafetyNetLogin} id="safetyLogin">Safety Net Login</button>
      {this.state.sent ?  <div>Sent!</div> : ''}
      </div>
    );
  }
}

export default TaxesOverviewMainPage;
