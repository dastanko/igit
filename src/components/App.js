/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Redirect, Switch, Route } from 'react-router-dom';

import Loading from './Loading';
import Authorize from './Authorize';
import Repos from './Repos';
import Header from './Header';
import { NO_TOKEN } from '../constants';
import { useState } from '../react-process';
import '../process';

export default function App() {
  const [ profile, { initialize } ] = useState('profile', null);

  useEffect(() => {
    initialize();
  }, []);

  if (profile === null) {
    return <Loading />;
  } else if (profile === NO_TOKEN) {
    return <Authorize />;
  }
  return (
    <Router>
      <Header profile={ profile } />
      <Switch>
        <Route path='/repos' component={ Repos } />
        { numOfRepos === 0 && <Redirect to='/repos' /> }
      </Switch>
    </Router>
  );
};