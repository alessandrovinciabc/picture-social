import React, { useEffect, useState } from 'react';

import './setupFirebase';
import firebase from 'firebase/app';

import useLoginStatus from './firebase/hooks/auth';
import { logout, getCurrentUser, login } from './firebase/auth';

import Header from './components/Header';

import GlobalStyle from './globalStyles';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Profile from './pages/Profile';
import PostView from './pages/PostView';
import Explore from './pages/Explore';
import Feed from './pages/Feed';

function App() {
  let loginStatus = useLoginStatus();
  let [currentUser, setCurrentUser] = useState<firebase.User | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, [loginStatus]);

  let handleLogout = () => {
    logout();
  };

  let handleLogin = () => {
    login();
  };

  return (
    <>
      <BrowserRouter>
        <Route path="/">
          <GlobalStyle />
          <Header
            logged={loginStatus}
            user={currentUser}
            handlers={{ login: handleLogin, logout: handleLogout }}
          />
        </Route>
        <Switch>
          <Route
            path="/"
            exact
            component={(props: any) => (
              <Feed {...props} currentUser={currentUser?.uid} />
            )}
          />
          <Route
            path="/p/:postId"
            exact
            component={(props: any) => (
              <PostView {...props} currentUser={currentUser?.uid} />
            )}
          />
          <Route path="/explore" exact component={Explore} />
          <Route
            path="/:profile"
            exact
            component={(props: any) => (
              <Profile {...props} currentUser={currentUser?.uid} />
            )}
          />
        </Switch>
      </BrowserRouter>
    </>
  );
}

export default App;
