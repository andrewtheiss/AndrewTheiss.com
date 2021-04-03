import React from 'react';

const SessionContext = React.createContext({
  authenticated: false,
  setAuthenticated: (auth) => {}
});

export default SessionContext;
