import React, { useEffect, useState } from 'react';

import './setupFirebase';
import firebase from 'firebase/app';

import useLoginStatus from './firebase/hooks/auth';
import { logout, getCurrentUser, login } from './firebase/auth';

import Header from './components/Header';

import GlobalStyle from './globalStyles';

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
      <GlobalStyle />
      <Header
        logged={loginStatus}
        user={currentUser}
        handlers={{ login: handleLogin, logout: handleLogout }}
      />
    </>
  );
}

export default App;
